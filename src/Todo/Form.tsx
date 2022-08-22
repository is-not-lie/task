import React, {
  forwardRef,
  ForwardRefRenderFunction,
  ReactNode,
  useCallback,
  useImperativeHandle,
} from 'react';
import {
  Form,
  FormItemProps,
  Input,
  InputNumber,
  InputNumberProps,
  InputProps,
  Select,
  SelectProps,
} from 'antd';

const FormController: ForwardRefRenderFunction<
  FormControllerRef,
  FormControllerProps
> = (props, ref) => {
  const [form] = Form.useForm();
  const { formItems } = props;

  const generateInputController = useCallback((item: FormItem) => {
    switch (item.type) {
      case 'input':
        return <Input {...(item.configs ?? {})} />;
      case 'inputNumber':
        return <InputNumber {...(item.configs ?? {})} />;
      case 'select':
        return <Select {...(item.configs ?? {})} />;
      default:
        return null;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    validate() {
      return form.validateFields();
    },
  }));

  return (
    <Form form={form}>
      {formItems.map((item) => {
        const { key, label, required, rules } = item;
        return (
          <Form.Item
            key={key}
            name={key}
            label={label}
            required={required}
            rules={rules}
          >
            {generateInputController(item)}
          </Form.Item>
        );
      })}
    </Form>
  );
};

interface BaseFormItem {
  key: string;
  label: ReactNode;
  required?: boolean;
  rules?: FormItemProps['rules'];
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

export type FormItem = InputFormItem | InputNumberFormItem | SelectFormItem;

interface FormControllerProps {
  formItems: FormItem[];
}

interface FormControllerRef {
  validate(): Promise<Record<string, any>>;
}

export default forwardRef(FormController);
