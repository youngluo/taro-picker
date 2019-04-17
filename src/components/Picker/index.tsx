import { View, PickerView, PickerViewColumn } from '@tarojs/components'
import Taro, { Component } from '@tarojs/taro'
import PropTypes from 'prop-types'
import Mask from '../Mask'
import './index.scss'

interface IProps {
  confirmText?: string,
  cancelText?: string,
  columns: string[][],
  itemHeight: number,
  onChange?(e): void,
  onConfirm?(): void,
  onCancel?(): void,
  onClick?(): void,
  visible: boolean,
  value: number[],
  title?: string,
}

class FtPicker extends Component<IProps> {
  static propTypes = {
    columns: PropTypes.array.isRequired,
    value: PropTypes.array.isRequired,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    itemHeight: PropTypes.number,
    onConfirm: PropTypes.func,
    onChange: PropTypes.func,
    onCancel: PropTypes.func,
    onClick: PropTypes.func,
    visible: PropTypes.bool,
    title: PropTypes.string
  }

  static defaultProps = {
    confirmText: '确定',
    cancelText: '取消',
    itemHeight: 42, // px
    visible: false,
    columns: [],
    title: ''
  }

  onClick() {
    this.props.onClick && this.props.onClick()
  }

  onCancel() {
    this.props.onCancel && this.props.onCancel()
  }

  onConfirm() {
    this.props.onConfirm && this.props.onConfirm()
  }

  onChange(e) {
    this.props.onChange && this.props.onChange(e)
  }

  render() {
    const { cancelText, confirmText, itemHeight, title, columns, value, visible } = this.props

    return (
      <View className='picker'>
        <View onClick={this.onClick}>
          {this.props.children}
        </View>
        <Mask
          onCancel={this.onCancel}
          visible={visible}
          position='bottom'
          type='slideUp'
        >
          <View className='picker'>
            <View className='picker-header'>
              <View
                className='picker-header-cancel'
                onClick={this.onCancel}
              >
                {cancelText}
              </View>
              <View className='picker-header-title'>
                {title}
              </View>
              <View
                className='picker-header-confirm'
                onClick={this.onConfirm}
              >
                {confirmText}
              </View>
            </View>
            <View className='picker-body'>
              <PickerView
                indicatorStyle={`height:${itemHeight}px`}
                className='picker-body-view'
                onChange={this.onChange}
                value={value}
              >
                {columns.map((col: string[], index) => (
                  <PickerViewColumn key={`id${index}`}>
                    {col.map((c, i) => (
                      <View
                        className='picker-body-column'
                        key={`${c}${i}`}
                      >
                        {c}
                      </View>
                    ))}
                  </PickerViewColumn>
                ))}
              </PickerView>
            </View>
          </View>
        </Mask>
      </View >
    )
  }
}

export default FtPicker