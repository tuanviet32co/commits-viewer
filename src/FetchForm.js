import React, { useEffect, useState } from 'react';
import { Form, DatePicker, InputNumber, Button } from 'antd';
import moment from 'moment';
import dayjs from 'dayjs';

const LOCAL_STORAGE_KEY = 'horizontalFormValues';

const getLc = () => {
  const savedValues = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedValues) {
    const parsedValues = JSON.parse(savedValues);
    if (parsedValues.since) {
      parsedValues.since = dayjs(parsedValues.since, 'YYYY-MM-DD');
    }
    return parsedValues;
  }

  return {
    since: null,
    per_page: 100,
  }
};

export const FetchForm = ({ onSummit }) => {
  const [initialValues, setInitialValues] = useState(getLc());

  useEffect(() => {
    // Retrieve saved form values from local storage
    const savedValues = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedValues) {
      const parsedValues = JSON.parse(savedValues);
      // Convert saved date string to moment object
      if (parsedValues.since) {
        parsedValues.since = moment(parsedValues.since);
      }
      setInitialValues(parsedValues);
    }
  }, []);

  const handleFinish = (values) => {
    // Convert date to UTC string and save to local storage
    const formattedValues = {
      since: values.since ? values.since.format() : null,
      per_page: values.per_page || 100,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formattedValues));
    console.log('Formatted Values:', formattedValues);
    onSummit(formattedValues);
  };

  return (
    <Form
      layout="inline"
      initialValues={initialValues}
      onFinish={handleFinish}
    >
      <Form.Item
        label="Per Page"
        name="per_page"
      >
        <InputNumber min={20} />
      </Form.Item>
      <Form.Item
        label="Since"
        name="since"
      >
        <DatePicker
          allowClear
          disabledDate={(current) => current && current > moment()}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};