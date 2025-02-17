/**
 * @namespace SuperDocTypes
 */
import { Editor } from '@harbour-enterprises/super-editor';
import { SuperDoc } from './SuperDoc';

/**
 * @typedef {Object} SuperDocTypes.User The current user of this superdoc
 * @property {string} name The user's name
 * @property {string} email The user's email
 * @property {string | null} image The user's photo
 */

/**
 * @typedef {Object} SuperDocTypes.Telemetry Telemetry configuration
 * @property {boolean} [enabled=true] Whether telemetry is enabled
 * @property {string} [licenceKey] The licence key for telemetry
 * @property {string} [endpoint] The endpoint for telemetry
 */


/**
 * @typedef {Object} SuperDocTypes.Document
 * @property {string} id The ID of the document
 * @property {string} type The type of the document
 * @property {File | null} [data] The initial data of the document
 */

/**
 * @typedef {Object} SuperDocTypes.Config
 * @property {string} [superdocId] The ID of the SuperDoc
 * @property {string} selector The selector to mount the SuperDoc into
 * @property {'editing' | 'viewing' | 'suggesting'} documentMode The mode of the document
 * @property {'editor' | 'viewer' | 'suggester'} [role] The role of the user in this SuperDoc
 * @property {Array<SuperDocTypes.Document>} documents The documents to load
 * @property {SuperDocTypes.User} [user] The current user of this SuperDoc
 * @property {Array<SuperDocTypes.User>} [users] All users of this SuperDoc (can be used for "@"-mentions)
 * @property {Array<string>} [colors] Colors to use for user awareness
 * @property {Object} [modules] Modules to load
 * @property {boolean} [pagination] Whether to show pagination in SuperEditors
 * @property {string} [toolbar] Optional DOM element to render the toolbar in
 * @property {Array<string>} [toolbarGroups] Toolbar groups to show
 * @property {Object} [toolbarIcons] Icons to show in the toolbar
 * @property {boolean} [isDev] Whether the SuperDoc is in development mode
 * @property {SuperDocTypes.Telemetry} [telemetry] Telemetry configuration
 * @property {(editor: Editor) => void} [onEditorBeforeCreate] Callback before an editor is created
 * @property {(editor: Editor) => void} [onEditorCreate] Callback after an editor is created
 * @property {() => void} [onEditorDestroy] Callback after an editor is destroyed
 * @property {(params: { error: object, editor: Editor, documentId: string, file: File })} [onContentError] Callback when there is an error in the content
 * @property {(editor: { superdoc: SuperDoc }) => void} [onReady] Callback when the SuperDoc is ready
 * @property {(params: { type: string, data: object}) => void} [onCommentsUpdate] Callback when comments are updated
 * @property {(params: { context: SuperDoc, states: Array }) => void} [onAwarenessUpdate] Callback when awareness is updated
 * @property {(params: { isLocked: boolean, lockedBy: SuperDocTypes.User }) => void} [onLocked] Callback when the SuperDoc is locked
 * @property {() => void} [onPdfDocumentReady] Callback when the PDF document is ready
 * @property {(isOpened: boolean) => void} [onSidebarToggle] Callback when the sidebar is toggled
 * @property {(params: { editor: Editor }) => void} [onCollaborationReady] Callback when collaboration is ready
 * @property {(params: { error: Exception }) => void} [onException] Callback when an exception is thrown
 */

export {};
