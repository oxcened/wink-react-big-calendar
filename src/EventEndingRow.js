import PropTypes from 'prop-types'
import React from 'react'
import EventRowMixin from './EventRowMixin'
import { eventLevels } from './utils/eventLevels'
import range from 'lodash/range'

let isSegmentInSlot = (seg, slot) => seg.left <= slot && seg.right >= slot
let eventsInSlot = (segments, slot) =>
  segments.filter(seg => isSegmentInSlot(seg, slot))

class EventEndingRow extends React.Component {
  render() {
    let {
      segments,
      slotMetrics: { slots },
    } = this.props
    let rowSegments = eventLevels(segments).levels[0]

    let current = 1,
      lastEnd = 1,
      row = []

    while (current <= slots) {
      let key = '_lvl_' + current

      let { event, left, right, span } =
        rowSegments.filter(seg => isSegmentInSlot(seg, current))[0] || {} //eslint-disable-line

      if (!event) {
        current++
        continue
      }

      let gap = Math.max(0, left - lastEnd)

      if (this.canRenderSlotEvent(left, span)) {
        let content = EventRowMixin.renderEvent(this.props, event)

        if (gap) {
          row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'))
        }

        row.push(EventRowMixin.renderSpan(slots, span, key, content))

        lastEnd = current = right + 1
      } else {
        if (gap) {
          row.push(EventRowMixin.renderSpan(slots, gap, key + '_gap'))
        }

        row.push(
          EventRowMixin.renderSpan(
            slots,
            1,
            key,
            this.renderShowMore(segments, current)
          )
        )
        lastEnd = current = current + 1
      }
    }

    return <div className="rbc-row">{row}</div>
  }

  canRenderSlotEvent(slot, span) {
    let { segments, eventLimitExcludeShowMore } = this.props

    return (
      !eventLimitExcludeShowMore &&
      range(slot, slot + span).every(s => {
        let count = eventsInSlot(segments, s).length

        return count === 1
      })
    )
  }

  renderShowMore(segments, slot) {
    let {
      localizer,
      onShowMoreMouseEnter,
      onShowMoreMouseLeave,
      range,
    } = this.props
    let slotEvents = eventsInSlot(segments, slot)
    const date = range[slot - 1]

    return slotEvents.length ? (
      <a
        key={'sm_' + slot}
        href="#"
        className={'rbc-show-more'}
        onClick={e => this.showMore(slot, e)}
        onMouseEnter={e =>
          onShowMoreMouseEnter &&
          onShowMoreMouseEnter(e, date, slotEvents.map(e => e.event))
        }
        onMouseLeave={e =>
          onShowMoreMouseLeave &&
          onShowMoreMouseLeave(e, date, slotEvents.map(e => e.event))
        }
      >
        {localizer.messages.showMore(
          slotEvents.length,
          date,
          slotEvents.map(e => e.event)
        )}
      </a>
    ) : (
      false
    )
  }

  showMore(slot, e) {
    e.preventDefault()
    this.props.onShowMore(slot, e.target)
  }
}

EventEndingRow.propTypes = {
  segments: PropTypes.array,
  slots: PropTypes.number,
  onShowMore: PropTypes.func,
  onShowMoreMouseEnter: PropTypes.func,
  onShowMoreMouseLeave: PropTypes.func,
  eventLimitExcludeShowMore: PropTypes.bool,
  range: PropTypes.array,
  ...EventRowMixin.propTypes,
}

EventEndingRow.defaultProps = {
  ...EventRowMixin.defaultProps,
}

export default EventEndingRow
