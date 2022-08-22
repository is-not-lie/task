import React, {
  forwardRef,
  ForwardRefRenderFunction,
  ReactNode,
  useCallback,
  useImperativeHandle,
} from 'react';
import {
  Col,
  Form,
  FormItemProps,
  FormProps,
  Input,
  InputNumber,
  InputNumberProps,
  InputProps,
  Row,
  Select,
  SelectProps,
} from 'antd';

const FormController: ForwardRefRenderFunction<
  FormControllerRef,
  FormControllerProps
> = (props, ref) => {
  const [form] = Form.useForm();
  const { formItems, defaultLayout, ...formProps } = props;

  const generateInputController = useCallback((item: FormItem) => {
    switch (item.type) {
      case 'input':
        return <Input {...(item.configs ?? {})} />;
      case 'inputNumber':
        return <InputNumber {...(item.configs ?? {})} />;
      case 'select':
        return <Select {...(item.configs ?? {})} />;
      case 'custom':
        return item.render(item.configs);
      default:
        return null;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    validate() {
      return form.validateFields();
    },
    clear() {
      form.resetFields();
    },
  }));

  return (
    <Form form={form} {...formProps}>
      <Row gutter={24} align="middle" justify="center">
        {formItems.map((item) => {
          const { key, label, required, rules, layout } = item;
          const {
            col = 24,
            labelCol = 6,
            wrapperCol = 18,
          } = Object.assign({}, defaultLayout ?? {}, layout ?? {});
          return (
            <Col span={col}>
              <Form.Item
                key={key}
                name={key}
                label={label}
                required={required}
                rules={rules}
                labelCol={{ span: labelCol }}
                wrapperCol={{ span: wrapperCol }}
              >
                {generateInputController(item)}
              </Form.Item>
            </Col>
          );
        })}
      </Row>
    </Form>
  );
};

type Layout = { labelCol?: number; wrapperCol?: number; col?: number };

type NoRequired<T> = {
  [P in keyof T]?: T[P];
};

interface BaseFormItem {
  key: string;
  label: ReactNode;
  required?: boolean;
  rules?: FormItemProps['rules'];
  layout?: Layout;
}

interface InputFormItem extends BaseFormItem {
  type: 'input';
  configs?: InputProps;
}

interface InputNumberFormItem extends BaseFormItem {
  type: 'inputNumber';
  configs?: InputNumberProps;
}

interface SelectFormItem extends BaseFormItem {
  type: 'select';
  configs?: SelectProps;
}

interface CustomFormItem extends NoRequired<BaseFormItem> {
  type: 'custom';
  configs?: Record<string, any>;
  render: (config?: Record<string, any>) => ReactNode;
}

export type FormItem =
  | InputFormItem
  | InputNumberFormItem
  | SelectFormItem
  | CustomFormItem;

interface FormControllerProps
  extends Omit<FormProps, 'form' | 'wrapperCol' | 'labelCol'> {
  defaultLayout?: Layout;
  formItems: FormItem[];
}

interface FormControllerRef {
  validate(): Promise<Record<string, any>>;
  clear(): void;
}

export default forwardRef(FormController);
