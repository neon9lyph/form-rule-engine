import type { Rule } from 'antd/es/form'

export type FieldName = string
export type FieldValue = unknown
export type FormValues = Record<FieldName, FieldValue>

export interface OptionItem {
  label: string
  value: string | number
}

export interface FieldMeta {
  visible?: boolean
  required?: boolean
  disabled?: boolean
  loading?: boolean
  options?: OptionItem[]
  rules?: Rule[]
}

export type FormMeta = Record<FieldName, FieldMeta>

export type RuleAction =
  | {
      type: 'SET_VALUE'
      field: FieldName
      value: FieldValue
    }
  | {
      type: 'CLEAR'
      field: FieldName
    }
  | {
      type: 'SHOW'
      field: FieldName
    }
  | {
      type: 'HIDE'
      field: FieldName
      clear?: boolean
    }
  | {
      type: 'REQUIRED'
      field: FieldName
      value: boolean
      message?: string
    }
  | {
      type: 'DISABLED'
      field: FieldName
      value: boolean
      clear?: boolean
    }
  | {
      type: 'SET_OPTIONS'
      field: FieldName
      options: OptionItem[]
    }
  | {
      type: 'SET_LOADING'
      field: FieldName
      value: boolean
    }
  | {
      type: 'SET_RULES'
      field: FieldName
      rules: Rule[]
    }
  | {
      type: 'VALIDATE'
      fields?: FieldName[]
    }

export type Dispatch = (action: RuleAction) => void

export type RequestFn = <T>(
  key: string,
  fn: () => Promise<T>,
) => Promise<T | undefined>

export interface FormRuleEngineForm {
  setFieldValue: (field: FieldName, value: FieldValue) => void
  getFieldsValue: (nameList?: true) => FormValues
  validateFields: (fields?: FieldName[]) => Promise<unknown> | unknown
}

export interface RuleContext {
  changedField: FieldName
  changedValue: FieldValue
  values: FormValues
  meta: FormMeta
  form: FormRuleEngineForm
  dispatch: Dispatch
  request: RequestFn
}

export interface FormRule {
  name: string
  deps: FieldName[]
  when?: (values: FormValues) => boolean
  effect: (context: RuleContext) => void | Promise<void>
}
