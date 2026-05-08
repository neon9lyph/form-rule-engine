import { useMemo, useRef, useState } from 'react';
import type { FormInstance } from 'antd/es/form';
import type { FormMeta, FormRule, FormValues } from './types';
import { FormRuleEngine } from './FormRuleEngine';

type UseFormRuleEngineOptions = {
  form: FormInstance;
  rules: FormRule[];
  initialMeta?: FormMeta;
};

export function useFormRuleEngine(options: UseFormRuleEngineOptions) {
  const { form, rules, initialMeta = {} } = options;

  const [meta, setMeta] = useState<FormMeta>(initialMeta);

  const engineRef = useRef<FormRuleEngine | null>(null);

  const engine = useMemo(() => {
    const instance = new FormRuleEngine({
      form,
      initialMeta,
      onMetaChange: nextMeta => {
        setMeta({ ...nextMeta });
      },
    });

    instance.registerRules(rules);

    engineRef.current = instance;

    return instance;
  }, [form]);

  const handleValuesChange = async (
    changedValues: FormValues,
    allValues: FormValues
  ) => {
    await engine.handleValuesChange(changedValues, allValues);
  };

  const getFieldMeta = (field: string) => {
    return meta[field] || {};
  };

  const isVisible = (field: string) => {
    return meta[field]?.visible !== false;
  };

  const isDisabled = (field: string) => {
    return Boolean(meta[field]?.disabled);
  };

  const getRules = (field: string) => {
    return meta[field]?.rules || [];
  };

  const getOptions = (field: string) => {
    return meta[field]?.options || [];
  };

  const isLoading = (field: string) => {
    return Boolean(meta[field]?.loading);
  };

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
  };
}