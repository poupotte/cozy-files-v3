import { Icon, Plus } from '@linagora/twake-icons'
import React, { useEffect, useState } from 'react'

import { useI18n } from 'twake-i18n'

import { BoardPreview } from './BoardPreview'
import styles from './board.styl'
import { BOARD_TEMPLATES, makeTemplateElements } from './boardTemplates'

import logger from '@/lib/logger'

// Elements of each template, drawn once for the tiles of the strip.
const useTemplateElements = () => {
  const { t } = useI18n()
  const [elementsById, setElementsById] = useState({})

  useEffect(() => {
    let isMounted = true
    const makeAll = async () => {
      try {
        const entries = await Promise.all(
          BOARD_TEMPLATES.map(async template => [
            template.id,
            await makeTemplateElements(template, t)
          ])
        )
        if (isMounted) setElementsById(Object.fromEntries(entries))
      } catch (error) {
        logger.warn('Could not draw the board templates', error)
      }
    }
    makeAll()
    return () => {
      isMounted = false
    }
  }, [t])

  return elementsById
}

/**
 * Create a board block of the Board page, as the VK Board home: an empty
 * board first, then the templates, in a row that scrolls sideways.
 *
 * @param {object} props - Component props
 * @param {Function} props.onCreate - Creates a board, from a template id or
 *   from nothing
 * @param {boolean} props.isCreating - Whether a board is being created
 */
export const BoardCreateStrip = ({ onCreate, isCreating }) => {
  const { t } = useI18n()
  const elementsById = useTemplateElements()

  return (
    <section className={styles['boardStrip']} aria-labelledby="board-strip">
      <h2 id="board-strip" className={styles['boardSection-title']}>
        {t('BoardHome.create_title')}
      </h2>
      <ul className={styles['boardStrip-list']}>
        <li>
          <button
            type="button"
            className={styles['boardTemplate']}
            disabled={isCreating}
            onClick={() => onCreate(null)}
            data-testid="board-template-blank"
          >
            <span className={styles['boardTemplate-blank']}>
              <Icon icon={Plus} size={24} />
            </span>
            <span className={styles['boardTemplate-name']}>
              {t('BoardHome.blank')}
            </span>
          </button>
        </li>
        {BOARD_TEMPLATES.map(({ id }) => (
          <li key={id}>
            <button
              type="button"
              className={styles['boardTemplate']}
              disabled={isCreating}
              onClick={() => onCreate(id)}
              data-testid={`board-template-${id}`}
            >
              {elementsById[id] ? (
                <BoardPreview elements={elementsById[id]} />
              ) : (
                <span className={styles['boardPreview']} />
              )}
              <span className={styles['boardTemplate-name']}>
                {t(`BoardHome.templates.${id}.name`)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
