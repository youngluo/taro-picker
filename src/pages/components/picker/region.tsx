import Taro, { Component } from '@tarojs/taro'
import { store, util } from '@/utils/index'
import PropTypes from 'prop-types'
import _ from 'lodash'
import http from '@/config/http'
import TagList from '../Tag/List'
import FtPicker from './index'

interface IProps {
  onConfirm?(v: string): void;
  adcode: string;
}

const differenceProvinces = ['81', '82'] // 香港、澳门特别行政区差异处理

class RegionPicker extends Component<IProps> {
  static propTypes = {
    onConfirm: PropTypes.func,
    adcode: PropTypes.string
  };

  static defaultProps = {
    adcode: ""
  };

  state = {
    placeholder: ["省", "市", "区"],
    currentValue: [0, 0, 0],
    visible: false,
    columns: []
  };

  dataList: any[] = [];

  async componentDidMount() {
    this.dataList = await this.getData()

    const { adcode } = this.props

    if (adcode) {
      this.setDefaultValue(this.dataList, adcode)
    }
  }

  componentWillUnmount() {
    this.dataList = []
  }

  private async getData() {
    let dataList = store.getItem('regionData')

    if (!_.isEmpty(dataList)) return dataList

    const [error, response] = await util.promiseCatcher(http.get('/address'))

    if (error) return util.handleError(error)

    dataList = response.results
    store.setItem('regionData', dataList)

    return dataList
  }

  private updateColumns(index: number[]) {
    const province = this.dataList[index[0]]
    const cityList = province ? province.children : []
    const county = cityList[index[1]]
    const countyList = county ? county.children : []

    this.setState({
      columns: [
        _.map(this.dataList, ({ name }) => name),
        _.map(cityList, ({ name }) => name),
        _.map(countyList, ({ name }) => name)
      ],
      currentValue: index
    })
  }

  private setDefaultValue(data, adcode) {
    let currentValue: number[] = []
    let currentData = data
    let adcodeSegments = this.segmentString(adcode)
    const isDifference = _.includes(differenceProvinces, adcodeSegments[0])

    if (isDifference) {
      adcodeSegments = this.remove(adcodeSegments, 1)
    }

    _.forEach(adcodeSegments, (item, i) => {
      const index = _.findIndex(currentData, (p: any) => {
        let currentAdcode = this.segmentString(p.adcode)

        if (isDifference) {
          currentAdcode = this.remove(currentAdcode, 1)
        }

        return _.isEqual(currentAdcode[i], item)
      })

      if (index === -1) return currentValue.push(0)

      currentValue.push(index)

      if (currentData[index]) {
        currentData = currentData[index].children
      }
    })

    this.updateColumns(currentValue)
  }

  private segmentString(string: string) {
    return _.map(_.chunk(_.split(string, ''), 2), item => item.join(''))
  }

  private remove(arr: any[], index: number) {
    const data = [...arr]

    _.remove(data, (v, i) => i === index)

    return data
  }

  onChange = e => {
    const oldValue = this.state.currentValue;
    const newValue = e.target.value;
    let currentvalue = [...newValue];

    if (oldValue[0] !== newValue[0]) {
      currentvalue[1] = 0;
      currentvalue[2] = 0;
    }

    if (oldValue[1] !== newValue[1]) {
      currentvalue[2] = 0;
    }

    this.updateColumns(currentvalue);
  };

  onClick = () => {
    this.setState({ visible: true });
  };

  onCancel = () => {
    this.setState({ visible: false });
  };

  onConfirm = () => {
    if (!this.props.onConfirm) return;

    let { currentValue, columns } = this.state;

    this.setState({
      placeholder: _.map(currentValue, (v, i) => columns[i][v] || "")
    });
    this.props.onConfirm(this.getAdcode(currentValue, this.dataList));
    this.onCancel();
  };

  private getAdcode(currentValue, dataList: any[] = []) {
    let data = [...dataList]
    let adcode = ''

    _.forEach(currentValue, v => {
      const dataItem = data[v]

      if (!dataItem) return

      if (!_.isEmpty(dataItem.children)) {
        data = dataItem.children
      } else {
        adcode = dataItem.adcode
        data = []
      }
    })

    return adcode
  }

  render() {
    const { visible, placeholder, columns, currentValue } = this.state

    return (
      <FtPicker
        onConfirm={this.onConfirm}
        onChange={this.onChange}
        onCancel={this.onCancel}
        onClick={this.onClick}
        value={currentValue}
        columns={columns}
        visible={visible}
      >
        <TagList dataSource={placeholder} />
      </FtPicker>
    )
  }
}

export default RegionPicker
