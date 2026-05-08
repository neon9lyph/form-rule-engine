import type { FormInstance, Rule } from 'antd/es/form';

export type FieldName = string;

export type FieldValue = unknown;

export type FormValues = Record<string, FieldValue>;

export type OptionItem = {
  label: string;
  value: string | number;
};

export type FieldMeta = {
  visible?: boolean;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  options?: OptionItem[];
  rules?: Rule[];
};

export type FormMeta = Record<FieldName, FieldMeta>;

export type RuleAction =
  | {
      type: 'SET_VALUE';
      field: FieldName;
      value: FieldValue;
    }
  | {
      type: 'CLEAR';
      field: FieldName;
    }
  | {
      type: 'SHOW';
      field: FieldName;
    }
  | {
      type: 'HIDE';
      field: FieldName;
      clear?: boolean;
    }
  | {
      type: 'REQUIRED';
      field: FieldName;
      value: boolean;
      message?: string;
    }
  | {
      type: 'DISABLED';
      field: FieldName;
      value: boolean;
      clear?: boolean;
    }
  | {
      type: 'SET_OPTIONS';
      field: FieldName;
      options: OptionItem[];
    }
  | {
      type: 'SET_LOADING';
      field: FieldName;
      value: boolean;
    }
  | {
      type: 'SET_RULES';
      field: FieldName;
      rules: Rule[];
    }
  | {
      type: 'VALIDATE';
      fields?: FieldName[];
    };

export type Dispatch = (action: RuleAction) => void;

export type RequestFn = <T>(
  key: string,
  fn: () => Promise<T>
) => Promise<T | undefined>;

export type RuleContext = {
  changedField: FieldName;
  changedValue: FieldValue;
  values: FormValues;
  meta: FormMeta;
  form: FormInstance;
  dispatch: Dispatch;
  request: RequestFn;
};

export type FormRule = {
  name: string;

  /**
   * 依赖字段。
   * 这些字段变化时，会触发当前规则。
   */
  deps: FieldName[];

  /**
   * 是否命中规则。
   */
  when?: (values: FormValues) => boolean;

  /**
   * 命中后执行的联动逻辑。
   */
  effect: (ctx: RuleContext) => void | Promise<void>;
};