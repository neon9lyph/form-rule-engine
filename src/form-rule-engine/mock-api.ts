import type { OptionItem } from './types'

const cityMap: Record<string, OptionItem[]> = {
  cn: [
    {
      label: '北京',
      value: 'beijing',
    },
    {
      label: '上海',
      value: 'shanghai',
    },
    {
      label: '深圳',
      value: 'shenzhen',
    },
  ],
  us: [
    {
      label: 'New York',
      value: 'new-york',
    },
    {
      label: 'San Francisco',
      value: 'san-francisco',
    },
    {
      label: 'Seattle',
      value: 'seattle',
    },
  ],
}

const delay = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })

export const userProfileApi = {
  async fetchCities(country: string): Promise<OptionItem[]> {
    await delay(5000)
    return cityMap[country] ?? []
  },

  async fetchVipBalance(): Promise<number> {
    await delay(500)
    return 8800
  },
}
