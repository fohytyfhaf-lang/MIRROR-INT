/* ===================================
            EVENT MANAGER
=================================== */

const events = new Map();

/* ===================================
            REGISTER
=================================== */

export function on(eventName, callback) {

    if (!events.has(eventName)) {
        events.set(eventName, []);
    }

    events.get(eventName).push(callback);

}

/* ===================================
            REMOVE
=================================== */

export function off(eventName, callback) {

    if (!events.has(eventName)) return;

    const list = events.get(eventName);

    const index = list.indexOf(callback);

    if (index !== -1) {
        list.splice(index, 1);
    }

}

/* ===================================
            TRIGGER
=================================== */

export function trigger(eventName, data = null) {

    console.log("[EVENT]", eventName, data);

    if (!events.has(eventName)) return;

    events.get(eventName).forEach(callback => {

        try {

            callback(data);

        } catch (error) {

            console.error(
                "[EVENT ERROR]",
                eventName,
                error
            );

        }

    });

}

/* ===================================
            ONCE
=================================== */

export function once(eventName, callback) {

    function wrapper(data) {

        callback(data);

        off(eventName, wrapper);

    }

    on(eventName, wrapper);

}

/* ===================================
            CLEAR
=================================== */

export function clear(eventName) {

    events.delete(eventName);

}

/* ===================================
            CLEAR ALL
=================================== */

export function clearAll() {

    events.clear();

}