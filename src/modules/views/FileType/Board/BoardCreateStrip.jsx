import { Icon, Plus } from '@linagora/twake-icons'
import React, { useEffect, useState } from 'react'

import Button from 'cozy-ui/transpiled/react/Buttons'
import { useI18n } from 'twake-i18n'

import { BoardPreview } from './BoardPreview'
import styles from './board.styl'
import { BOARD_TEMPLATES, makeTemplateElements } from './boardTemplates'
import { PageTemplateTile } from '../UserTemplates/UserTemplateTiles'

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
 * @param {React.ReactNode} [props.userTemplates] - Tiles of the templates the
 *   user saved, shown after the others
 * @param {Function} [props.onEditTemplate] - Edits a template of the page,
 *   from its id
 * @param {Function} [props.renderCustomizedTemplate] - Tile of the template
 *   the user saved in place of a template of the page, from its id, or null
 * @param {string[]} [props.hiddenTemplateIds] - Templates of the page the
 *   user removed
 * @param {Function} [props.onRemoveTemplate] - Removes a template of the
 *   page, from its id
 * @param {Function} [props.onRestoreTemplates] - Shows the removed
 *   templates again
 */
export const BoardCreateStrip = ({
  onCreate,
  isCreating,
  userTemplates,
  onEditTemplate,
  renderCustomizedTemplate,
  hiddenTemplateIds = [],
  onRemoveTemplate,
  onRestoreTemplates
}) => {
  const { t } = useI18n()
  const elementsById = useTemplateElements()
  const templateIds = BOARD_TEMPLATES.map(({ id }) => id).filter(
    id => !hiddenTemplateIds.includes(id)
  )

  return (
    <section className={styles['boardStrip']} aria-labelledby="board-strip">
      <div className={styles['boardSection-head']}>
        <h2 id="board-strip" className={styles['boardSection-title']}>
          {t('BoardHome.create_title')}
        </h2>
        {onRestoreTemplates && hiddenTemplateIds.length > 0 && (
          <Button
            variant="text"
            size="small"
            label={t('UserTemplates.restore', {
              smart_count: hiddenTemplateIds.length
            })}
            onClick={onRestoreTemplates}
            data-testid="templates-restore"
          />
        )}
      </div>
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
        {templateIds.map(id => {
          const name = t(`BoardHome.templates.${id}.name`)
          return (
            renderCustomizedTemplate?.(id) ?? (
              <PageTemplateTile
                key={id}
                name={name}
                onEdit={onEditTemplate && (() => onEditTemplate(id))}
                onRemove={onRemoveTemplate && (() => onRemoveTemplate(id))}
              >
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
                  <span className={styles['boardTemplate-name']}>{name}</span>
                </button>
              </PageTemplateTile>
            )
          )
        })}
        {userTemplates}
      </ul>
    </section>
  )
}
