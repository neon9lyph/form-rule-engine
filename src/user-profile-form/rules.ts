import type { FormRule, OptionItem } from '../form-rule-engine/types'

export interface UserProfileRuleServices {
  fetchCities: (country: string) => Promise<OptionItem[]>
  fetchVipBalance: () => Promise<number>
}

export const createUserProfileRules = (
  services: UserProfileRuleServices,
): FormRule[] => [
  {
    name: 'VIP 用户显示折扣码并拉取余额',
    deps: ['userType'],
    when: (values) => values.userType === 'VIP',
    effect: async ({ dispatch, request }) => {
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
      dispatch({
        type: 'SHOW',
        field: 'balance',
      })
      dispatch({
        type: 'SET_LOADING',
        field: 'balance',
        value: true,
      })

      const balance = await request('vip-balance', services.fetchVipBalance)

      if (balance !== undefined) {
        dispatch({
          type: 'SET_VALUE',
          field: 'balance',
          value: balance,
        })
      }

      dispatch({
        type: 'SET_LOADING',
        field: 'balance',
        value: false,
      })
    },
  },
  {
    name: '非 VIP 用户隐藏折扣码并清空余额',
    deps: ['userType'],
    when: (values) => values.userType !== 'VIP',
    effect: ({ dispatch }) => {
      dispatch({
        type: 'HIDE',
        field: 'discountCode',
        clear: true,
      })
      dispatch({
        type: 'REQUIRED',
        field: 'discountCode',
        value: false,
      })
      dispatch({
        type: 'HIDE',
        field: 'balance',
        clear: true,
      })
    },
  },
  {
    name: '国家变化时清空城市并重新加载选项',
    deps: ['country'],
    effect: async ({ values, dispatch, request }) => {
      dispatch({
        type: 'CLEAR',
        field: 'city',
      })
      dispatch({
        type: 'SET_OPTIONS',
        field: 'city',
        options: [],
      })

      if (typeof values.country !== 'string' || !values.country) {
        return
      }

      dispatch({
        type: 'SET_LOADING',
        field: 'city',
        value: true,
      })

      const cities = await request(`city-options:${values.country}`, () =>
        services.fetchCities(String(values.country)),
      )

      if (cities) {
        dispatch({
          type: 'SET_OPTIONS',
          field: 'city',
          options: cities,
        })
      }

      dispatch({
        type: 'SET_LOADING',
        field: 'city',
        value: false,
      })
    },
  },
  {
    name: '需要发票时显示并必填发票抬头',
    deps: ['needInvoice'],
    when: (values) => values.needInvoice === true,
    effect: ({ dispatch }) => {
      dispatch({
        type: 'SHOW',
        field: 'invoiceTitle',
      })
      dispatch({
        type: 'REQUIRED',
        field: 'invoiceTitle',
        value: true,
        message: '请输入发票抬头',
      })
    },
  },
  {
    name: '不需要发票时隐藏并清空发票抬头',
    deps: ['needInvoice'],
    when: (values) => values.needInvoice !== true,
    effect: ({ dispatch }) => {
      dispatch({
        type: 'HIDE',
        field: 'invoiceTitle',
        clear: true,
      })
      dispatch({
        type: 'REQUIRED',
        field: 'invoiceTitle',
        value: false,
      })
    },
  },
  {
    name: '银行转账时显示并必填银行账号',
    deps: ['paymentMethod'],
    when: (values) => values.paymentMethod === 'bank',
    effect: ({ dispatch }) => {
      dispatch({
        type: 'SHOW',
        field: 'bankAccount',
      })
      dispatch({
        type: 'REQUIRED',
        field: 'bankAccount',
        value: true,
        message: '请输入银行账号',
      })
    },
  },
  {
    name: '非银行转账时隐藏并清空银行账号',
    deps: ['paymentMethod'],
    when: (values) => values.paymentMethod !== 'bank',
    effect: ({ dispatch }) => {
      dispatch({
        type: 'HIDE',
        field: 'bankAccount',
        clear: true,
      })
      dispatch({
        type: 'REQUIRED',
        field: 'bankAccount',
        value: false,
      })
    },
  },
]
