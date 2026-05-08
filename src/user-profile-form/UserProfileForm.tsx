import { useMemo } from 'react'
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  message,
} from 'antd'
import { userProfileApi } from '../form-rule-engine/mock-api'
import { useFormRuleEngine } from '../form-rule-engine/useFormRuleEngine'
import type { FormMeta, FormValues } from '../form-rule-engine/types'
import { createUserProfileRules } from './rules'

const initialMeta: FormMeta = {
  discountCode: {
    visible: false,
    rules: [],
  },
  balance: {
    visible: false,
    disabled: true,
    loading: false,
  },
  city: {
    options: [],
    loading: false,
  },
  invoiceTitle: {
    visible: false,
    rules: [],
  },
  bankAccount: {
    visible: false,
    rules: [],
  },
}

const countryOptions = [
  {
    label: '中国',
    value: 'cn',
  },
  {
    label: '美国',
    value: 'us',
  },
]

const userTypeOptions = [
  {
    label: '普通用户',
    value: 'NORMAL',
  },
  {
    label: 'VIP 用户',
    value: 'VIP',
  },
]

const paymentMethodOptions = [
  {
    label: '现金',
    value: 'cash',
  },
  {
    label: '银行转账',
    value: 'bank',
  },
]

export default function UserProfileForm() {
  const [form] = Form.useForm<FormValues>()
  const rules = useMemo(() => createUserProfileRules(userProfileApi), [])
  const {
    engine,
    handleValuesChange,
    isVisible,
    isDisabled,
    getRules,
    getOptions,
    isLoading,
    meta,
  } = useFormRuleEngine({
    form,
    rules,
    initialMeta,
  })

  const handleFinish = (values: FormValues) => {
    message.success('提交成功')
    console.log(values)
  }

  const handleReset = () => {
    form.resetFields()
    engine.setMeta(initialMeta)
  }

  return (
    <Card title="用户资料表单" extra={<Button onClick={() => console.log(meta)}>打印 meta</Button>}>
      <Form<FormValues>
        form={form}
        layout="vertical"
        initialValues={{
          userType: 'NORMAL',
          needInvoice: false,
          paymentMethod: 'cash',
        }}
        onFinish={handleFinish}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          label="用户类型"
          name="userType"
          rules={[
            {
              required: true,
              message: '请选择用户类型',
            },
          ]}
        >
          <Select options={userTypeOptions} />
        </Form.Item>

        {isVisible('discountCode') && (
          <Form.Item label="VIP 折扣码" name="discountCode" rules={getRules('discountCode')}>
            <Input placeholder="请输入 VIP 折扣码" />
          </Form.Item>
        )}

        {isVisible('balance') && (
          <Form.Item label="VIP 余额" name="balance">
            <InputNumber
              addonAfter="元"
              disabled={isDisabled('balance')}
              placeholder={isLoading('balance') ? '余额加载中...' : 'VIP 余额'}
              style={{
                width: '100%',
              }}
            />
          </Form.Item>
        )}

        <Form.Item
          label="国家"
          name="country"
          rules={[
            {
              required: true,
              message: '请选择国家',
            },
          ]}
        >
          <Select allowClear options={countryOptions} placeholder="请选择国家" />
        </Form.Item>

        <Form.Item
          label="城市"
          name="city"
          rules={[
            {
              required: true,
              message: '请选择城市',
            },
          ]}
        >
          <Select
            allowClear
            loading={isLoading('city')}
            options={getOptions('city')}
            placeholder="请先选择国家"
          />
        </Form.Item>

        <Form.Item label="是否需要发票" name="needInvoice" valuePropName="checked">
          <Switch />
        </Form.Item>

        {isVisible('invoiceTitle') && (
          <Form.Item label="发票抬头" name="invoiceTitle" rules={getRules('invoiceTitle')}>
            <Input placeholder="请输入发票抬头" />
          </Form.Item>
        )}

        <Form.Item
          label="付款方式"
          name="paymentMethod"
          rules={[
            {
              required: true,
              message: '请选择付款方式',
            },
          ]}
        >
          <Select options={paymentMethodOptions} />
        </Form.Item>

        {isVisible('bankAccount') && (
          <Form.Item label="银行账号" name="bankAccount" rules={getRules('bankAccount')}>
            <Input placeholder="请输入银行账号" />
          </Form.Item>
        )}

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
            <Button htmlType="button" onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )
}
