import { useState, useRef } from 'react';
import { Button, Divider, Input, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

let index = 0;

export const SyncSelect = ({
  value,
  setValue,
  storageValueKey,
  defaultReposOptions = [],
  className,
}) => {
  const storageOptionsKey = `${storageValueKey}_OPTIONS`;
  const [options, setOptions] = useState(JSON.parse(localStorage.getItem(storageOptionsKey) || JSON.stringify(defaultReposOptions)));

  const [name, setName] = useState('');
  const inputRef = useRef(null);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const addItem = (e) => {
    e.preventDefault();
    setOptions((v) => {
      const nextVal = [...v, name || `New Item ${index++}`];
      localStorage.setItem(storageOptionsKey, JSON.stringify(nextVal));
      return nextVal;
    });
    setName('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <Select
      value={value}
      onChange={(val) => {
        setValue(val);
        localStorage.setItem(storageValueKey, val);
      }}
      popupRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} />
          <div className='flex gap-2 px-3 pb-3'>
            <Input
              placeholder="Please enter item"
              ref={inputRef}
              value={name}
              onChange={onNameChange}
              onKeyDown={(e) => e.stopPropagation()}
            />
            <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
              Add
            </Button>
          </div>
        </>
      )}
      options={options.map((item) => ({ label: item, value: item }))}
      className={className}
    />
  );
};
