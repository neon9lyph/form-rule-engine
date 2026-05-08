import { describe, expect, it, vi } from 'vitest'
import { FormRuleEngine } from './FormRuleEngine'
import type { FormMeta, FormRule, FormValues } from './types'

const createForm = (initialValues: FormValues = {}) => {
  const values = { ...initialValues }

  return {
    setFieldValue: vi.fn((field: string, value: unknown) => {
      values[field] = value
    }),
    getFieldsValue: vi.fn(() => ({ ...values })),
    validateFields: vi.fn(),
  }
}

describe('FormRuleEngine', () => {
  it('runs matching rules for changed dependencies and updates field meta', async () => {
    let latestMeta: FormMeta = {}
    const form = createForm({ userType: 'VIP' })
    const engine = new FormRuleEngine({
      form,
      initialMeta: {
        discountCode: {
          visible: false,
          rules: [],
        },
      },
      onMetaChange: (meta) => {
        latestMeta = meta
      },
    })

    const rules: FormRule[] = [
      {
        name: 'VIP user requires discount code',
        deps: ['userType'],
        when: (values) => values.userType === 'VIP',
        effect: ({ dispatch }) => {
          dispatch({
            type: 'SHOW',
            field: 'discountCode',
          })
          dispatch({
            type: 'REQUIRED',
            field: 'discountCode',
            value: true,
            message: '请输入 VIP 折扣码',
          })
        },
      },
    ]

    engine.registerRules(rules)

    await engine.handleValuesChange(
      {
        userType: 'VIP',
      },
      {
        userType: 'VIP',
      },
    )

    expect(latestMeta.discountCode).toEqual({
      visible: true,
      required: true,
      rules: [
        {
          required: true,
          message: '请输入 VIP 折扣码',
        },
      ],
    })
  })

  it('dispatches hide with clear by hiding meta and clearing form value', async () => {
    let latestMeta: FormMeta = {}
    const form = createForm({
      userType: 'NORMAL',
      discountCode: 'VIP2026',
    })
    const engine = new FormRuleEngine({
      form,
      initialMeta: {
        discountCode: {
          visible: true,
        },
      },
      onMetaChange: (meta) => {
        latestMeta = meta
      },
    })

    engine.registerRule({
      name: 'Normal user hides discount code',
      deps: ['userType'],
      when: (values) => values.userType !== 'VIP',
      effect: ({ dispatch }) => {
        dispatch({
          type: 'HIDE',
          field: 'discountCode',
          clear: true,
        })
      },
    })

    await engine.handleValuesChange(
      {
        userType: 'NORMAL',
      },
      {
        userType: 'NORMAL',
      },
    )

    expect(latestMeta.discountCode).toEqual({
      visible: false,
    })
    expect(form.setFieldValue).toHaveBeenCalledWith('discountCode', undefined)
  })

  it('keeps only the latest async request result for the same request key', async () => {
    const form = createForm({ country: 'cn' })
    const engine = new FormRuleEngine({ form })
    let resolveFirst: (value: string[]) => void = () => undefined
    let resolveSecond: (value: string[]) => void = () => undefined

    engine.registerRule({
      name: 'Load city options',
      deps: ['country'],
      effect: async ({ request, dispatch, values }) => {
        const cities = await request('cities', () => {
          return new Promise<string[]>((resolve) => {
            if (values.country === 'cn') {
              resolveFirst = resolve
            } else {
              resolveSecond = resolve
            }
          })
        })

        if (cities) {
          dispatch({
            type: 'SET_VALUE',
            field: 'city',
            value: cities[0],
          })
        }
      },
    })

    const firstRun = engine.handleValuesChange(
      {
        country: 'cn',
      },
      {
        country: 'cn',
      },
    )
    const secondRun = engine.handleValuesChange(
      {
        country: 'us',
      },
      {
        country: 'us',
      },
    )

    resolveSecond(['new-york'])
    await secondRun
    resolveFirst(['beijing'])
    await firstRun

    expect(form.setFieldValue).toHaveBeenCalledTimes(1)
    expect(form.setFieldValue).toHaveBeenCalledWith('city', 'new-york')
  })
})
