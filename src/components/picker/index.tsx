import { View, PickerView, PickerViewColumn, Block } from '@tarojs/components'
import { PickerViewProps } from '@tarojs/components/types/PickerView'
import Taro, { FC, memo } from '@tarojs/taro'
import _ from 'lodash'
import FtMask from '../Mask'
import './index.scss'

export interface PickerColumnItem {
  label: string;
  value: string;
}

type PickerViewPartialProps = Pick<PickerViewProps, 'value' | 'onChange' | 'onPickEnd' | 'onPickStart'>

interface IProps extends Partial<PickerViewPartialProps> {
  /**
   * Picker 列表数据
   */
  columns: Array<string | PickerColumnItem>[];
  confirmText?: string;
  cancelText?: string;
  /**
   * PickerViewColumn 高度，单位 px
   */
  itemHeight?: number;
  onConfirm?(): void;
  onCancel?(): void;
  /**
   * Picker 被包裹元素点击事件
   */
  onClick?(): void;
  visible?: boolean;
  title?: string;
}

const noop = () => { }

const FtPicker: FC<IProps> = props => {
  const {
    onPickStart = noop,
    onPickEnd = noop,
    onConfirm = noop,
    onCancel = noop,
    onChange = noop,
    onClick = noop,
    confirmText = '确定',
    cancelText = '取消',
    itemHeight = 42,
    visible = false,
    columns = [],
    value = [],
    title
  } = props

  return (
    <Block>
      <View
        className='ft-picker-children'
        onClick={onClick}
      >
        {props.children}
      </View>
      <FtMask
        onCancel={onCancel}
        visible={visible}
        position='bottom'
        type='slideUp'
      >
        <View
          className='ft-picker'
          hoverStopPropagation
        >
          <View className='ft-picker-header'>
            <View
              className='ft-picker-header-cancel'
              onClick={onCancel}
            >
              {cancelText}
            </View>
            <View className='ft-picker-header-title'>
              {title}
            </View>
            <View
              className='ft-picker-header-confirm'
              onClick={onConfirm}
            >
              {confirmText}
            </View>
          </View>
          <View className='ft-picker-body'>
            <PickerView
              indicatorStyle={`height:${itemHeight}px`}
              className='ft-picker-body-view'
              onPickStart={onPickStart}
              onPickEnd={onPickEnd}
              onChange={onChange}
              value={value}
            >
              {columns.map((col, index) => (
                <PickerViewColumn key={`id-${index}`}>
                  {col && col.map(item => (
                    <View
                      key={`${_.get(item, 'value', item)}`}
                      className='ft-picker-body-column'
                    >
                      {_.get(item, 'label', item)}
                    </View>
                  ))}
                </PickerViewColumn>
              ))}
            </PickerView>
          </View>
        </View>
      </FtMask>
    </Block>
  )
}

export default memo(FtPicker)