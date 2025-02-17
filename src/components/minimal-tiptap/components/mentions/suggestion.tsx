import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'

import MentionList from './mention-list'

import {client} from "../../../../App"
import { GET_USERS_BY_ORG } from '@/graphql/user/queries'

export default {

  items: async ({ query }) => {
    const { data } = await client.query({ query: GET_USERS_BY_ORG });
    return data.getUsersByOrg
      .filter(item => item.firstName.toLowerCase().startsWith(query.toLowerCase()) || item.lastName.toLowerCase().startsWith(query.toLowerCase()))
      .slice(0, 5)
  },

  render: () => {
    let component
    let popup

    return {
      onStart: props => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        })
        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate(props) {
        component.updateProps(props)

        if (!props.clientRect) {
          return
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup[0].hide()

          return true
        }

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        popup[0].destroy()
        component.destroy()
      },
    }
  },
}