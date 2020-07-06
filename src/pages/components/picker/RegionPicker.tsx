import Taro, { FC, memo, useState, useEffect, useRef, useCallback } from '@tarojs/taro'
import { store, util } from '@/utils'
import http from '@/config/http'
import _ from 'lodash'
import FtPicker, { PickerColumnItem } from './index'
import './regionPicker.scss'

type PickerColumn = Array<string | PickerColumnItem>

interface IProps {
  onConfirm?(v: PickerColumn): void;
  onCancel?(): void;
  disabled?: boolean;
  visible?: boolean;
  adcode?: string;
}

const MAX_COLUMN = 3
const noop = () => { }

const RegionPicker: FC<IProps> = props => {
  const {
    onConfirm = noop,
    onCancel = noop,
    disabled = false,
    visible = false,
    adcode
  } = props
  const [columns, setColumns] = useState<PickerColumn[]>([])
  const [currentVisible, setVisible] = useState(visible)
  const [value, setValue] = useState([0, 0, 0])
  const [mounted, setMounted] = useState(false)
  const fullData = useRef([])

  const getData = useCallback(async () => {
    if (!_.isEmpty(fullData.current)) return fullData.current
    const result = store.getItem('regionData')
    if (!_.isEmpty(result)) return result
    const [error, response] = await util.promiseCatcher(http.get('/address'))
    if (error) return util.handleError(error)
    const dataList = _.get(response, 'results')
    store.setItem('regionData', dataList)

    return dataList
  }, [])

  const updateColumns = useCallback((v: number[] = []) => {
    let col: any[] = fullData.current
    setColumns(_.reduce(v, (prev: PickerColumn[], cur) => {
      prev.push(_.map(col, c => ({ label: c.name, value: c.adcode })))
      col = _.get(col, `${cur}.districts`)

      return prev
    }, []))
  }, [])

  const getValueByAdcode = useCallback((data: any[], defaultAdcode: string) => {
    let currentAdcode = ''

    const defaultValue = _.reduce(
      _.map(_.chunk(defaultAdcode, 2), item => _.join(item, '')),
      (prev: any[], code) => {
        currentAdcode += code
        if (code === '00') return prev
        const index = _.findIndex(data, item => _.startsWith(item.adcode, currentAdcode))
        if (index >= 0) {
          prev.push(index)
          data = _.get(data, `${index}.districts`)
        }

        return prev
      }, []
    )
    const size = _.size(defaultValue)

    // 默认值保持三列数据（特别行政区只有两列）
    return size < MAX_COLUMN ? _.concat(defaultValue, _.fill(Array(MAX_COLUMN - size), 0)) : defaultValue
  }, [])

  useEffect(() => {
    (async () => {
      fullData.current = await getData()
      if (adcode) setValue(getValueByAdcode(fullData.current, adcode))
      setMounted(true)
    })()
  }, [getData, getValueByAdcode, adcode])

  useEffect(() => {
    if (disabled) return
    setVisible(visible)
  }, [visible, disabled])

  useEffect(() => {
    if (mounted) updateColumns(value)
  }, [updateColumns, value, mounted])

  const handleChange = useCallback(e => {
    let newValue: number[] = e.target.value
    _.forEach(_.dropRight(newValue), (colIndex, index) => {
      // 比较新旧 column index 是否变化，如果变化后面的 index 置为 0
      if (colIndex !== value[index]) {
        newValue = _.map(newValue, (c, i) => i > index ? 0 : c)
      }
    })
    setValue(newValue)
  }, [value])

  const handleCancel = useCallback(() => {
    setVisible(false)
    onCancel()
  }, [onCancel])

  const handleConfirm = useCallback(() => {
    setVisible(false)
    onConfirm(_.compact(_.map(value, (colIndex, index) => columns[index][colIndex])))
  }, [columns, value, onConfirm])

  const handleClick = useCallback(() => {
    if (disabled) return
    setVisible(true)
  }, [disabled])

  return (
    <FtPicker
      onConfirm={handleConfirm}
      visible={currentVisible}
      onCancel={handleCancel}
      onChange={handleChange}
      onClick={handleClick}
      columns={columns}
      value={value}
    >
      {props.children}
    </FtPicker>
  )
}

export default memo(RegionPicker)