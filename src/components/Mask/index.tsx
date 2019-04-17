import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import './index.scss'

interface IProps {
  type: 'slideDown' | 'slideUp', // animation type
  position: 'top' | 'bottom', // mask content position
  maskClosable?: boolean,
  onCancel(): void,
  duration: number,
  visible: boolean,
}

class Mask extends Component<IProps> {
  static propTypes = {
    type: PropTypes.oneOf(['slideDown', 'slideUp']),
    position: PropTypes.oneOf(['top', 'bottom']),
    onCancel: PropTypes.func.isRequired,
    visible: PropTypes.bool.isRequired,
    maskClosable: PropTypes.bool,
    duration: PropTypes.number
  }

  static defaultProps = {
    maskClosable: true,
    type: 'slideDown',
    position: 'top',
    visible: false,
    duration: 250
  }

  state = {
    curVisible: this.props.visible,
    animationStatus: ''
  }

  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps

    if (visible === this.state.curVisible) return

    if (visible) {
      this.setState({ animationStatus: 'enter', curVisible: true })
    } else {
      this.setState({ animationStatus: 'leave' })
      setTimeout(() => {
        this.setState({ curVisible: false })
        this.props.onCancel && this.props.onCancel()
      }, this.props.duration)
    }
  }

  onStopPropagation(e) {
    e.stopPropagation()
  }

  onMaskClick() {
    this.props.maskClosable && this.props.onCancel && this.props.onCancel()
  }

  render() {
    const { animationStatus, curVisible } = this.state
    const { type, position } = this.props

    return (
      curVisible && (
        <View
          className={classNames('mask', `mask-fade-${animationStatus}`, `mask-position-${position}`)}
          onTouchMove={this.onStopPropagation}
          onClick={this.onMaskClick}
        >
          <View
            className={classNames('mask-content', `mask-content-${type}-${animationStatus}`)}
            onClick={this.onStopPropagation}
          >
            {this.props.children}
          </View>
        </View>
      )
    )
  }
}

export default Mask