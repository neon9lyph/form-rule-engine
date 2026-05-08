import type { FormInstance } from 'antd/es/form';
import type {
  FieldMeta,
  FieldName,
  FormMeta,
  FormRule,
  FormValues,
  RequestFn,
  RuleAction,
  RuleContext,
} from './types';

export class FormRuleEngine {
  private form: FormInstance;

  private meta: FormMeta = {};

  private rules: FormRule[] = [];

  private depMap = new Map<FieldName, FormRule[]>();

  private runningFields = new Set<FieldName>();

  private requestTokens = new Map<string, number>();

  private onMetaChange?: (meta: FormMeta) => void;

  constructor(options: {
    form: FormInstance;
    initialMeta?: FormMeta;
    onMetaChange?: (meta: FormMeta) => void;
  }) {
    this.form = options.form;
    this.meta = options.initialMeta || {};
    this.onMetaChange = options.onMetaChange;
  }

  registerRule(rule: FormRule) {
    this.rules.push(rule);

    for (const dep of rule.deps) {
      const existingRules = this.depMap.get(dep) || [];
      existingRules.push(rule);
      this.depMap.set(dep, existingRules);
    }
  }

  registerRules(rules: FormRule[]) {
    rules.forEach(rule => this.registerRule(rule));
  }

  getMeta() {
    return this.meta;
  }

  setMeta(meta: FormMeta) {
    this.meta = meta;
    this.emitMetaChange();
  }

  /**
   * AntD Form 的 onValuesChange 入口。
   */
  async handleValuesChange(
    changedValues: FormValues,
    allValues: FormValues
  ) {
    const changedFields = Object.keys(changedValues);

    for (const field of changedFields) {
      await this.runRules(field, changedValues[field], allValues);
    }
  }

  private async runRules(
    changedField: FieldName,
    changedValue: unknown,
    allValues: FormValues
  ) {
    const relatedRules = this.depMap.get(changedField) || [];

    if (relatedRules.length === 0) return;

    if (this.runningFields.has(changedField)) {
      console.warn(`[FormRuleEngine] 检测到循环联动，已跳过字段: ${changedField}`);
      return;
    }

    this.runningFields.add(changedField);

    try {
      for (const rule of relatedRules) {
        const latestValues = {
          ...allValues,
          ...this.form.getFieldsValue(true),
        };

        const matched = rule.when ? rule.when(latestValues) : true;

        if (!matched) continue;

        const ctx: RuleContext = {
          changedField,
          changedValue,
          values: latestValues,
          meta: this.meta,
          form: this.form,
          dispatch: this.dispatch,
          request: this.request,
        };

        await rule.effect(ctx);
      }
    } finally {
      this.runningFields.delete(changedField);
    }
  }

  private dispatch = (action: RuleAction) => {
    switch (action.type) {
      case 'SET_VALUE': {
        this.form.setFieldValue(action.field, action.value);
        break;
      }

      case 'CLEAR': {
        this.form.setFieldValue(action.field, undefined);
        break;
      }

      case 'SHOW': {
        this.patchMeta(action.field, {
          visible: true,
        });
        break;
      }

      case 'HIDE': {
        this.patchMeta(action.field, {
          visible: false,
        });

        if (action.clear) {
          this.form.setFieldValue(action.field, undefined);
        }

        break;
      }

      case 'REQUIRED': {
        this.patchMeta(action.field, {
          required: action.value,
          rules: action.value
            ? [
                {
                  required: true,
                  message: action.message || '该字段必填',
                },
              ]
            : [],
        });

        break;
      }

      case 'DISABLED': {
        this.patchMeta(action.field, {
          disabled: action.value,
        });

        if (action.clear) {
          this.form.setFieldValue(action.field, undefined);
        }

        break;
      }

      case 'SET_OPTIONS': {
        this.patchMeta(action.field, {
          options: action.options,
        });

        break;
      }

      case 'SET_LOADING': {
        this.patchMeta(action.field, {
          loading: action.value,
        });

        break;
      }

      case 'SET_RULES': {
        this.patchMeta(action.field, {
          rules: action.rules,
        });

        break;
      }

      case 'VALIDATE': {
        if (action.fields?.length) {
          this.form.validateFields(action.fields);
        } else {
          this.form.validateFields();
        }

        break;
      }

      default: {
        const exhaustiveCheck: never = action;
        return exhaustiveCheck;
      }
    }
  };

  private patchMeta(field: FieldName, patch: FieldMeta) {
    this.meta = {
      ...this.meta,
      [field]: {
        ...this.meta[field],
        ...patch,
      },
    };

    this.emitMetaChange();
  }

  private emitMetaChange() {
    this.onMetaChange?.(this.meta);
  }

  /**
   * 处理异步请求竞态。
   * 同一个 key 的请求，只允许最后一次生效。
   */
  private request: RequestFn = async <T>(
    key: string,
    fn: () => Promise<T>
  ): Promise<T | undefined> => {
    const token = (this.requestTokens.get(key) || 0) + 1;

    this.requestTokens.set(key, token);

    const result = await fn();

    if (this.requestTokens.get(key) !== token) {
      return undefined;
    }

    return result;
  };
}