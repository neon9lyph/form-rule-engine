import type {
  FieldMeta,
  FieldName,
  FormMeta,
  FormRule,
  FormRuleEngineForm,
  FormValues,
  RequestFn,
  RuleAction,
  RuleContext,
} from "./types";

export class FormRuleEngine {
  private meta: FormMeta;
  private readonly depMap = new Map<FieldName, FormRule[]>();
  private readonly requestTokens = new Map<string, number>();
  private readonly form: FormRuleEngineForm;
  private readonly onMetaChange?: (meta: FormMeta) => void;

  constructor(options: {
    form: FormRuleEngineForm;
    initialMeta?: FormMeta;
    onMetaChange?: (meta: FormMeta) => void;
  }) {
    this.form = options.form;
    this.meta = options.initialMeta ?? {};
    this.onMetaChange = options.onMetaChange;
  }

  registerRule(rule: FormRule) {
    for (const dep of rule.deps) {
      const rules = this.depMap.get(dep) ?? [];
      rules.push(rule);
      this.depMap.set(dep, rules);
    }
  }

  registerRules(rules: FormRule[]) {
    rules.forEach((rule) => {
      this.registerRule(rule);
    });
  }

  getMeta() {
    return this.meta;
  }

  setMeta(meta: FormMeta) {
    this.meta = meta;
    this.emitMetaChange();
  }

  async handleValuesChange(changedValues: FormValues, allValues: FormValues) {
    const changedFields = Object.keys(changedValues);

    for (const field of changedFields) {
      await this.runRules(field, changedValues[field], allValues);
    }
  }

  private async runRules(
    changedField: FieldName,
    changedValue: unknown,
    allValues: FormValues,
  ) {
    const relatedRules = this.depMap.get(changedField) ?? [];

    for (const rule of relatedRules) {
      const latestValues = {
        ...this.form.getFieldsValue(true),
        ...allValues,
      };
      const matched = rule.when ? rule.when(latestValues) : true;

      if (!matched) {
        continue;
      }

      const context: RuleContext = {
        changedField,
        changedValue,
        values: latestValues,
        meta: this.meta,
        form: this.form,
        dispatch: this.dispatch,
        request: this.request,
      };

      await rule.effect(context);
    }
  }

  private dispatch = (action: RuleAction) => {
    if (action.type === "SET_VALUE") {
      this.form.setFieldValue(action.field, action.value);
      return;
    }

    if (action.type === "CLEAR") {
      this.form.setFieldValue(action.field, undefined);
      return;
    }

    if (action.type === "SHOW") {
      this.patchMeta(action.field, {
        visible: true,
      });
      return;
    }

    if (action.type === "HIDE") {
      this.patchMeta(action.field, {
        visible: false,
      });

      if (action.clear) {
        this.form.setFieldValue(action.field, undefined);
      }

      return;
    }

    if (action.type === "REQUIRED") {
      this.patchMeta(action.field, {
        required: action.value,
        rules: action.value
          ? [
              {
                required: true,
                message: action.message ?? "该字段必填",
              },
            ]
          : [],
      });
      return;
    }

    if (action.type === "DISABLED") {
      this.patchMeta(action.field, {
        disabled: action.value,
      });

      if (action.clear) {
        this.form.setFieldValue(action.field, undefined);
      }

      return;
    }

    if (action.type === "SET_OPTIONS") {
      this.patchMeta(action.field, {
        options: action.options,
      });
      return;
    }

    if (action.type === "SET_LOADING") {
      this.patchMeta(action.field, {
        loading: action.value,
      });
      return;
    }

    if (action.type === "SET_RULES") {
      this.patchMeta(action.field, {
        rules: action.rules,
      });
      return;
    }

    if (action.type === "VALIDATE") {
      void this.form.validateFields(action.fields);
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

  private request: RequestFn = async <T>(
    key: string,
    fn: () => Promise<T>,
  ): Promise<T | undefined> => {
    const token = (this.requestTokens.get(key) ?? 0) + 1;

    this.requestTokens.set(key, token);
    console.log("token", this.requestTokens, key, token);

    const result = await fn();

    console.log("after result", this.requestTokens.get(key), token);

    if (this.requestTokens.get(key) !== token) {
      return undefined;
    }

    return result;
  };
}
