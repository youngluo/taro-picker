import { View, Block } from '@tarojs/components'
import Taro, { Component } from '@tarojs/taro'
import { AtCalendar } from 'taro-ui'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Mask from '../Mask'
import Tag from '../Tag'
import './dateRange.scss'

interface IProps {
  onConfirm?(value: string[]): void;
  onCancel?():void;
  placeholder: string[];
  confirmText: string;
  cancelText: string;
  start: string;
  end: string;
  maskVisible?:boolean;
  hiddenPlaceholder?:boolean;
}

class DateRange extends Component<IProps> {
  static propTypes = {
    confirmText: PropTypes.string,
    placeholder: PropTypes.array,
    cancelText: PropTypes.string,
    onConfirm: PropTypes.func,
    start: PropTypes.string,
    end: PropTypes.string
  }

  static defaultProps = {
    placeholder: ['开始时间', '结束时间'],
    confirmText: '确定',
    cancelText: '取消',
    start: '2018/6/1',
    end: ''
  }

  state = {
    visible: false,
    value: [],
    error: ''
  }

  tempValue: string[] = []

  onConfirm = () => {
    if (!this.props.onConfirm) return

    if (this.tempValue.length === 2) {
      this.props.onConfirm(this.tempValue)
      this.setState({ value: this.tempValue })
      this.onCancel()
    } else {
      this.setState({ error: '请选择时间段' })
    }
  }

  onDayClick = ({ value }) => {
    if (this.tempValue.length === 2) {
      this.tempValue = []
    }

    this.tempValue.push(value)
    this.tempValue = _.sortBy(this.tempValue, [(v => new Date(v))])
    this.setState({ error: '' })
  }

  onCancel = () => {
    const {onCancel} = this.props
    this.setState({ visible: false })
    onCancel && onCancel()
  }

  onClick = () => {
    this.setState({ visible: true })
  }

  render() {
    const { placeholder, cancelText, confirmText, start, end, maskVisible, hiddenPlaceholder } = this.props
    const { value, visible, error } = this.state

    return (
      <Block>
        {
          !hiddenPlaceholder && <View
            onClick={this.onClick}
            className='date-range'
          >
            <View className='date-range-item'>
              <Tag>{value[0] || placeholder[0]}</Tag>
            </View>
            <View className='date-range-divide'>~</View>
            <View className='date-range-item'>
              <Tag>{value[1] || placeholder[1]}</Tag>
            </View>
          </View>
        }
     
        <Mask
          onCancel={this.onCancel}
          visible={maskVisible||visible}
          position='bottom'
          type='slideUp'
        >
          <View className='date-range-body'>
            <View className='date-range-header'>
              <View
                className='date-range-header-cancel'
                onClick={this.onCancel}
              >
                {cancelText}
              </View>
              <View className='date-range-header-error'>
                {!!error ? error : ''}
              </View>
              <View
                className='date-range-header-confirm'
                onClick={this.onConfirm}
              >
                {confirmText}
              </View>
            </View>
            <AtCalendar
              onDayClick={this.onDayClick}
              minDate={start}
              maxDate={end}
              isMultiSelect
            />
          </View>
        </Mask>
      </Block>
    )
  }
}

export default DateRange