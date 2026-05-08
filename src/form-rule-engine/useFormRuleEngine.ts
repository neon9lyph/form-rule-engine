import { useMemo, useState } from 'react'
import type { FormInstance } from 'antd/es/form'
import { FormRuleEngine } from './FormRuleEngine'
import type { FieldName, FormMeta, FormRule, FormValues } from './types'

interface UseFormRuleEngineOptions {
  form: FormInstance
  rules: FormRule[]
  initialMeta?: FormMeta
}

export function useFormRuleEngine(options: UseFormRuleEngineOptions) {
  const { form, initialMeta = {}, rules } = options
  const [meta, setMeta] = useState<FormMeta>(initialMeta)

  const engine = useMemo(() => {
    const instance = new FormRuleEngine({
      form,
      initialMeta,
      onMetaChange: (nextMeta) => {
        setMeta({ ...nextMeta })
      },
    })

    instance.registerRules(rules)
    return instance
  }, [form, initialMeta, rules])

  const handleValuesChange = async (
    changedValues: FormValues,
    allValues: FormValues,
  ) => {
    await engine.handleValuesChange(changedValues, allValues)
  }

  const getFieldMeta = (field: FieldName) => meta[field] ?? {}
  const isVisible = (field: FieldName) => meta[field]?.visible !== false
  const isDisabled = (field: FieldName) => Boolean(meta[field]?.disabled)
  const getRules = (field: FieldName) => meta[field]?.rules ?? []
  const getOptions = (field: FieldName) => meta[field]?.options ?? []
  const isLoading = (field: FieldName) => Boolean(meta[field]?.loading)

  return {
    engine,
    meta,
    handleValuesChange,
    getFieldMeta,
    isVisible,
    isDisabled,
    getRules,
    getOptions,
    isLoading,
  }
}
