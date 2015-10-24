/**
 * Initializes click handlers for the navigational links
 *
 * @param   {jQuery} container
 * @param   {Object} listeners
 * @return
 */
export default function initRouter (container, listeners) {
  container.find('#home_link').on('click', listeners.showHome)
  container.find('#sharing_link').on('click', listeners.showSharing)
  container.find('#faq_link').on('click', listeners.showFAQ)
  container.find('#map_link').on('click', listeners.showMap)
}
