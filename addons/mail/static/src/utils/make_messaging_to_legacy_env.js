/** @odoo-module **/
import env from 'web.env'

export function makeMessagingToLegacyEnv(legacyEnv) {
    return {
        dependencies: ['messaging'],
        start(_, { messaging }) {
            legacyEnv.services.messaging = messaging;
        },
    };
}
