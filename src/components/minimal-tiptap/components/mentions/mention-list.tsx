
import { cn } from '@/lib/utils'
import {
  forwardRef, useEffect, useImperativeHandle,
  useState,
} from 'react'

export default forwardRef((props, ref) => {

  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]

    if (item) {
      props.command({
        ...item,
        user_id: item.id, 
        id: item.lastName+', '+item.firstName
      })
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="flex w-full flex-col items-start bg-white border shadow gap-y-2">
      {props.items.length
        ? props.items.map((item, index) => (
          <button
            className={cn(
              'w-full px-4 py-1 rounded-sm',
              index === selectedIndex && 'bg-purple-600 text-white'
            )}
            key={index}
            onClick={() => {
              selectItem(index)
            }}
          >
            {`${item.lastName}, ${item.firstName}`}
          </button>
        ))
        : <div className="item">No result</div>
      }
    </div>
  )
})