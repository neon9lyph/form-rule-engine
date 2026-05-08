import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Upload,
  message,
} from "antd";
import type { UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { bigFormRules } from "./form-rule-engine/rules";
import { useFormRuleEngine } from "./form-rule-engine/useFormRuleEngine";
import type { FormMeta } from "./form-rule-engine/types";

const initialMeta: FormMeta = {
  discountCode: {
    visible: false,
    required: false,
    rules: [],
  },
  companyName: {
    visible: false,
    required: false,
    rules: [],
  },
  bankCardNo: {
    visible: false,
    required: false,
    rules: [],
  },
  incomeProof: {
    visible: false,
    required: false,
    rules: [],
  },
  balance: {
    disabled: true,
    loading: false,
  },
  city: {
    options: [],
    loading: false,
  },
};

const uploadProps: UploadProps = {
  beforeUpload: () => false,
  maxCount: 1,
};

export default function BigFormPage() {
  const [form] = Form.useForm();

  const {
    handleValuesChange,
    isVisible,
    isDisabled,
    getRules,
    getOptions,
    isLoading,
    meta,
  } = useFormRuleEngine({
    form,
    rules: bigFormRules,
    initialMeta,
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      console.log("submit values:", values);

      message.success("提交成功，请查看控制台");
    } catch (error) {
      console.log("validate error:", error);
    }
  };

  return (
    <Card
      title="巨型表单联动示例"
      style={{ maxWidth: 900, margin: "24px auto" }}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        initialValues={{
          userType: undefined,
          country: undefined,
          city: undefined,
          paymentType: undefined,
          loanAmount: undefined,
        }}
      >
        <Form.Item
          label="用户类型"
          name="userType"
          rules={[
            {
              required: true,
              message: "请选择用户类型",
            },
          ]}
        >
          <Select
            placeholder="请选择用户类型"
            options={[
              {
                label: "个人用户",
                value: "PERSONAL",
              },
              {
                label: "企业用户",
                value: "COMPANY",
              },
              {
                label: "VIP 用户",
                value: "VIP",
              },
            ]}
          />
        </Form.Item>

        {isVisible("discountCode") && (
          <Form.Item
            label="优惠码"
            name="discountCode"
            rules={getRules("discountCode")}
          >
            <Input placeholder="请输入优惠码" />
          </Form.Item>
        )}

        {isVisible("companyName") && (
          <Form.Item
            label="公司名称"
            name="companyName"
            rules={getRules("companyName")}
          >
            <Input placeholder="请输入公司名称" />
          </Form.Item>
        )}

        <Form.Item label="账户余额" name="balance">
          <InputNumber
            style={{ width: "100%" }}
            disabled={isDisabled("balance")}
            placeholder={isLoading("balance") ? "余额加载中..." : "账户余额"}
          />
        </Form.Item>

        <Form.Item
          label="国家 / 地区"
          name="country"
          rules={[
            {
              required: true,
              message: "请选择国家或地区",
            },
          ]}
        >
          <Select
            placeholder="请选择国家或地区"
            options={[
              {
                label: "中国",
                value: "CN",
              },
              {
                label: "新加坡",
                value: "SG",
              },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="城市"
          name="city"
          rules={[
            {
              required: true,
              message: "请选择城市",
            },
          ]}
        >
          <Select
            placeholder="请选择城市"
            loading={isLoading("city")}
            options={getOptions("city")}
          />
        </Form.Item>

        <Form.Item
          label="支付方式"
          name="paymentType"
          rules={[
            {
              required: true,
              message: "请选择支付方式",
            },
          ]}
        >
          <Select
            placeholder="请选择支付方式"
            options={[
              {
                label: "余额支付",
                value: "BALANCE",
              },
              {
                label: "银行卡支付",
                value: "BANK_CARD",
              },
            ]}
          />
        </Form.Item>

        {isVisible("bankCardNo") && (
          <Form.Item
            label="银行卡号"
            name="bankCardNo"
            rules={getRules("bankCardNo")}
          >
            <Input placeholder="请输入银行卡号" />
          </Form.Item>
        )}

        <Form.Item label="贷款金额" name="loanAmount">
          <InputNumber
            style={{ width: "100%" }}
            placeholder="请输入贷款金额"
            min={0}
          />
        </Form.Item>

        {isVisible("incomeProof") && (
          <Form.Item
            label="收入证明"
            name="incomeProof"
            valuePropName="fileList"
            getValueFromEvent={(event) => {
              if (Array.isArray(event)) {
                return event;
              }

              return event?.fileList;
            }}
            rules={getRules("incomeProof")}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传收入证明</Button>
            </Upload>
          </Form.Item>
        )}

        <Form.Item>
          <Space>
            <Button type="primary" onClick={handleSubmit}>
              提交
            </Button>

            <Button
              onClick={() => {
                form.resetFields();
              }}
            >
              重置
            </Button>

            <Button
              onClick={() => {
                console.log("当前 values:", form.getFieldsValue(true));
                console.log("当前 meta:", meta);
              }}
            >
              打印当前状态
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
