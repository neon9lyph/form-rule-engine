import type { FormRule, OptionItem } from "./types";

const fakeApi = {
  async fetchBalance(userType: string) {
    return new Promise<number>((resolve) => {
      setTimeout(() => {
        if (userType === "VIP") {
          resolve(9999);
        } else {
          resolve(100);
        }
      }, 500);
    });
  },

  async fetchCities(country: string) {
    return new Promise<OptionItem[]>((resolve) => {
      setTimeout(() => {
        if (country === "CN") {
          resolve([
            {
              label: "北京",
              value: "beijing",
            },
            {
              label: "上海",
              value: "shanghai",
            },
            {
              label: "深圳",
              value: "shenzhen",
            },
          ]);
          return;
        }

        if (country === "SG") {
          resolve([
            {
              label: "Singapore",
              value: "singapore",
            },
          ]);
          return;
        }

        resolve([]);
      }, 500);
    });
  },
};

export const bigFormRules: FormRule[] = [
  {
    name: "VIP 用户显示优惠码并拉取余额",
    deps: ["userType"],
    when: (values) => values.userType === "VIP",
    effect: async ({ values, dispatch, request }) => {
      dispatch({
        type: "SHOW",
        field: "discountCode",
      });

      dispatch({
        type: "REQUIRED",
        field: "discountCode",
        value: true,
        message: "VIP 用户必须填写优惠码",
      });

      dispatch({
        type: "SET_LOADING",
        field: "balance",
        value: true,
      });

      const balance = await request("fetchBalance", () => {
        return fakeApi.fetchBalance(String(values.userType));
      });

      if (balance !== undefined) {
        dispatch({
          type: "SET_VALUE",
          field: "balance",
          value: balance,
        });
      }

      dispatch({
        type: "SET_LOADING",
        field: "balance",
        value: false,
      });
    },
  },

  {
    name: "非 VIP 用户隐藏优惠码并清空余额",
    deps: ["userType"],
    when: (values) => values.userType !== "VIP",
    effect: ({ dispatch }) => {
      dispatch({
        type: "HIDE",
        field: "discountCode",
        clear: true,
      });

      dispatch({
        type: "REQUIRED",
        field: "discountCode",
        value: false,
      });

      dispatch({
        type: "CLEAR",
        field: "balance",
      });
    },
  },

  {
    name: "企业用户显示公司名称并设为必填",
    deps: ["userType"],
    when: (values) => values.userType === "COMPANY",
    effect: ({ dispatch }) => {
      dispatch({
        type: "SHOW",
        field: "companyName",
      });

      dispatch({
        type: "REQUIRED",
        field: "companyName",
        value: true,
        message: "企业用户必须填写公司名称",
      });
    },
  },

  {
    name: "个人用户隐藏公司名称并清空",
    deps: ["userType"],
    when: (values) => values.userType === "PERSONAL",
    effect: ({ dispatch }) => {
      dispatch({
        type: "HIDE",
        field: "companyName",
        clear: true,
      });

      dispatch({
        type: "REQUIRED",
        field: "companyName",
        value: false,
      });
    },
  },

  {
    name: "国家变化时清空城市并重新加载城市选项",
    deps: ["country"],
    effect: async ({ values, dispatch, request }) => {
      dispatch({
        type: "CLEAR",
        field: "city",
      });

      dispatch({
        type: "SET_OPTIONS",
        field: "city",
        options: [],
      });

      if (!values.country) return;

      dispatch({
        type: "SET_LOADING",
        field: "city",
        value: true,
      });

      const cities = await request(`fetchCities:${values.country}`, () => {
        return fakeApi.fetchCities(String(values.country));
      });

      if (cities) {
        dispatch({
          type: "SET_OPTIONS",
          field: "city",
          options: cities,
        });
      }

      dispatch({
        type: "SET_LOADING",
        field: "city",
        value: false,
      });
    },
  },

  {
    name: "银行卡支付时显示银行卡号并设为必填",
    deps: ["paymentType"],
    when: (values) => values.paymentType === "BANK_CARD",
    effect: ({ dispatch }) => {
      dispatch({
        type: "SHOW",
        field: "bankCardNo",
      });

      dispatch({
        type: "REQUIRED",
        field: "bankCardNo",
        value: true,
        message: "请选择银行卡支付时，银行卡号必填",
      });
    },
  },

  {
    name: "非银行卡支付时隐藏银行卡号并清空",
    deps: ["paymentType"],
    when: (values) => values.paymentType !== "BANK_CARD",
    effect: ({ dispatch }) => {
      dispatch({
        type: "HIDE",
        field: "bankCardNo",
        clear: true,
      });

      dispatch({
        type: "REQUIRED",
        field: "bankCardNo",
        value: false,
      });
    },
  },

  {
    name: "贷款金额大于 10000 时，收入证明必填",
    deps: ["loanAmount"],
    when: (values) => {
      const amount = Number(values.loanAmount || 0);
      return amount > 10000;
    },
    effect: ({ dispatch }) => {
      dispatch({
        type: "SHOW",
        field: "incomeProof",
      });

      dispatch({
        type: "REQUIRED",
        field: "incomeProof",
        value: true,
        message: "贷款金额大于 10000 时，收入证明必填",
      });
    },
  },

  {
    name: "贷款金额不超过 10000 时，隐藏收入证明",
    deps: ["loanAmount"],
    when: (values) => {
      const amount = Number(values.loanAmount || 0);
      return amount <= 10000;
    },
    effect: ({ dispatch }) => {
      dispatch({
        type: "HIDE",
        field: "incomeProof",
        clear: true,
      });

      dispatch({
        type: "REQUIRED",
        field: "incomeProof",
        value: false,
      });
    },
  },
];
