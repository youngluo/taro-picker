import Taro, { PureComponent } from '@tarojs/taro'
import PropTypes from 'prop-types'
import _ from 'lodash'
import FtPicker from './index'

function getDate(date?: Date | number | string) {
  let curDate = date || new Date()

  if (_.isString(curDate) && _.includes(curDate, '-')) {
    curDate = _.replace(curDate, '-', '/')
  }

  curDate = _.isDate(curDate) ? curDate : new Date(curDate)

  return [curDate.getFullYear(), curDate.getMonth() + 1, curDate.getDate()]
}

const now = getDate().join('/')

interface IProps {
  type?: 'date' | 'time' | 'datetime',
  onConfirm?(value): void,
  confirmText?: string,
  cancelText?: string,
  itemHeight: number,
  visible: boolean,
  title?: string,
  value: string,
  start: string, // 起始范围
  end: string, // 结束范围
}

interface IState {
  currentIndexValue: number[],
  currentVisible: boolean
}

class DatePicker extends PureComponent<IProps, IState> {
  static propTypes = {
    type: PropTypes.oneOf(['date', 'time', 'datetime']),
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    itemHeight: PropTypes.number,
    onConfirm: PropTypes.func,
    visible: PropTypes.bool,
    title: PropTypes.string,
    value: PropTypes.string,
    start: PropTypes.string,
    end: PropTypes.string
  }

  static defaultProps = {
    confirmText: '确定',
    cancelText: '取消',
    start: '2016/6/1',
    visible: false,
    type: 'date',
    value: now,
    end: now,
    title: ''
  }

  currentTrueValue = getDate(this.props.value)

  state = {
    currentIndexValue: this.getIndexValue(this.currentTrueValue),
    currentVisible: this.props.visible
  }

  componentWillReceiveProps(nextProps) {
    const { visible, value } = nextProps

    this.currentTrueValue = getDate(value)
    this.setState({
      currentIndexValue: this.getIndexValue(this.currentTrueValue),
      currentVisible: visible
    })
  }

  onClick = () => {
    this.setState({ currentVisible: true })
  }

  onCancel = () => {
    this.setState({ currentVisible: false })
  }

  onConfirm = () => {
    if (this.props.onConfirm) {
      this.props.onConfirm(this.currentTrueValue)
      this.onCancel()
    }
  }

  onChange = (e) => {
    const currentIndexValue = e.target.value

    this.currentTrueValue = this.getTrueValue(currentIndexValue)
    this.setState({ currentIndexValue })
  }

  private get columns() {
    const [startYear, startMonth, startDay] = this.getBoundary('start')
    const [endYear, endMonth, endDay] = this.getBoundary('end')

    return [
      this.range(startYear, endYear),
      this.range(startMonth, endMonth),
      this.range(startDay, endDay)
    ]
  }

  private getBoundary(type: string) {
    const [bYear, bMonth, bDay] = getDate(this.props[type])
    const [curYear, curMonth] = this.currentTrueValue
    let month = 1
    let day = 1

    if (type === 'end') {
      month = 12
      day = this.getMonthEndDay(curYear, curMonth)
    }

    if (curYear === bYear) {
      month = bMonth

      if (curMonth === month) {
        day = bDay
      }
    }

    return [bYear, month, day]
  }

  private getIndexValue(trueValue: string | number[]) {
    return _.map(
      _.isString(trueValue) ? getDate(trueValue) : trueValue,
      (col, index) => _.indexOf(this.columns[index], this.pad(col))
    )
  }

  private getTrueValue(indexValue: number[]) {
    return _.map(indexValue, (index, colIndex) => +this.columns[colIndex][index])
  }

  private getMonthEndDay(year, month) {
    return new Date(year, month, 0).getDate()
  }

  private range(start: number, end: number) {
    return [...Array(end - start + 1).keys()].map(i => this.pad(i + start))
  }

  private pad(val) {
    return _.padStart(val, 2, '0')
  }

  render() {
    const { currentVisible, currentIndexValue } = this.state

    return (
      <FtPicker
        value={currentIndexValue}
        onConfirm={this.onConfirm}
        onChange={this.onChange}
        onCancel={this.onCancel}
        visible={currentVisible}
        onClick={this.onClick}
        columns={this.columns}
      >
        {this.props.children}
      </FtPicker>
    )
  }
}

export default DatePicker