import { useState, useRef } from 'react';
import { Button, Divider, Input, Select, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

let index = 0;

export const SyncSelect = ({
  value,
  setValue,
  storageValueKey,
  defaultReposOptions = [],
  hideAddOption = false,
  className,
}) => {
  const storageOptionsKey = `${storageValueKey}_OPTIONS`;
  const [options, setOptions] = useState(
    JSON.parse(localStorage.getItem(storageOptionsKey) || JSON.stringify(defaultReposOptions))
  );

  const [name, setName] = useState('');
  const inputRef = useRef(null);

  const addItem = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setOptions((prev) => {
      const nextVal = [...prev, name || `New Item ${index++}`];
      localStorage.setItem(storageOptionsKey, JSON.stringify(nextVal));
      return nextVal;
    });
    setName('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const removeItem = (item) => {
    setOptions((prev) => {
      const nextVal = prev.filter((i) => i !== item);
      localStorage.setItem(storageOptionsKey, JSON.stringify(nextVal));

      if (value === item) {
        setValue(undefined);
        localStorage.removeItem(storageValueKey);
      }
      return nextVal;
    });
  };

  return (
    <Select
      value={value}
      onChange={(val) => {
        setValue(val);
        localStorage.setItem(storageValueKey, val);
      }}
      popupRender={!hideAddOption ? (menu) => (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} />
          <div className='flex gap-2 px-3 pb-3'>
            <Input
              placeholder="Please enter item"
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
            />
            <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
              Add
            </Button>
          </div>
        </>
      ) : undefined}
      // ✅ label is plain string (for clean selected value)
      options={options.map((item) => ({ label: item, value: item }))}
      // ✅ render delete icon only inside dropdown options
      optionRender={!hideAddOption ? (option) => (
        <Space className="flex justify-between w-full">
          <span>{option.label}</span>
          <DeleteOutlined
            style={{ color: '#ffa39e'}}
            onClick={(e) => {
              e.stopPropagation();
              removeItem(option.value);
            }}
          />
        </Space>
      ): undefined}
      className={className}
    />
  );
};
