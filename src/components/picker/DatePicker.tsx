import Taro, { FC, memo, useState, useCallback, useEffect } from '@tarojs/taro'
import { View, Block } from '@tarojs/components'
import { AtCalendar } from 'taro-ui'
import dayjs from 'dayjs'
import _ from 'lodash'
import FtMask from '../Mask'
import './datePicker.scss'

interface Range {
  start: string;
  end: string;
}

interface IProps {
  onConfirm?(value: string | Range): void;
  min?: string | number | Date;
  max?: string | number | Date;
  confirmText?: string;
  cancelText?: string;
  disabled?: boolean;
  onCancel?(): void;
  visible?: boolean;
  format?: string;
  /**
   * 是否开启范围选择
   */
  range?: boolean;
  title?: string;
}

const noop = () => { }

const DatePicker: FC<IProps> = props => {
  const {
    format = 'YYYY/MM/DD',
    confirmText = '确定',
    cancelText = '取消',
    onConfirm = noop,
    onCancel = noop,
    disabled = false,
    visible = false,
    range = false,
    title,
    min,
    max
  } = props

  const [currentVisible, setVisible] = useState(visible)
  // @ts-ignore
  const [value, setValue] = useState<Range>({})

  useEffect(() => {
    if (disabled) return
    setVisible(visible)
  }, [visible, disabled])

  const onSelect = useCallback(date => {
    setValue(date.value)
  }, [])

  const handleConfirm = useCallback(() => {
    if (!range) {
      onConfirm(value.start || dayjs().format(format))
    } else if (value.end) {
      onConfirm(value)
    } else {
      return
    }
    setVisible(false)
  }, [value, range, format, onConfirm])

  const handleCancel = useCallback(() => {
    setVisible(false)
    onCancel()
  }, [onCancel])

  const handleClick = useCallback(() => {
    if (disabled) return
    setVisible(true)
  }, [disabled])

  return (
    <Block>
      <View
        className='ft-date-picker'
        onClick={handleClick}
      >
        {props.children}
      </View>
      <FtMask
        visible={currentVisible}
        onCancel={handleCancel}
        position='bottom'
        type='slideUp'
      >
        <View
          className='ft-date-picker-body'
          hoverStopPropagation
        >
          <View className='ft-date-picker-header'>
            <View
              className='ft-date-picker-cancel'
              onClick={handleCancel}
            >
              {cancelText}
            </View>
            <View className='ft-date-picker-title'>
              {title}
            </View>
            <View
              className='ft-date-picker-confirm'
              onClick={handleConfirm}
            >
              {confirmText}
            </View>
          </View>
          <AtCalendar
            onSelectDate={onSelect}
            isMultiSelect={range}
            format={format}
            minDate={min}
            maxDate={max}
            isVertical
            hideArrow
          />
        </View>
      </FtMask>
    </Block>
  )
}

DatePicker.options = {
  addGlobalClass: true
}

export default memo(DatePicker)