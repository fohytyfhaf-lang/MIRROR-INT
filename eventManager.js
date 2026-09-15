/* ===================================
            EVENT MANAGER
=================================== */

const events = new Map();

/* ===================================
            REGISTER
=================================== */

export function on(eventName, callback) {

    if (
        typeof eventName !== "string" ||
        !eventName.trim()
    ) {
        console.warn(
            "[EVENT] Invalid event name:",
            eventName
        );

        return () => {};
    }

    if (typeof callback !== "function") {

        console.warn(
            "[EVENT] Invalid callback for:",
            eventName
        );

        return () => {};
    }

    if (!events.has(eventName)) {
        events.set(eventName, []);
    }

    const list = events.get(eventName);

    /* Prevent duplicate registration */

    if (!list.includes(callback)) {
        list.push(callback);
    }

    /*
        Return unsubscribe helper.
        This does not replace off().
    */

    return () => {
        off(eventName, callback);
    };

}


/* ===================================
            REMOVE
=================================== */

export function off(eventName, callback) {

    if (!events.has(eventName)) {
        return;
    }

    const list = events.get(eventName);

    const index = list.indexOf(callback);

    if (index !== -1) {
        list.splice(index, 1);
    }

    /*
        Remove empty event buckets.
    */

    if (list.length === 0) {
        events.delete(eventName);
    }

}


/* ===================================
            TRIGGER
=================================== */

export function trigger(eventName, data = null) {

    console.log(
        "[EVENT]",
        eventName,
        data
    );

    if (!events.has(eventName)) {
        return;
    }

    /*
        Use a snapshot.

        This prevents problems when handlers
        call on() / off() while the event is
        currently being dispatched.
    */

    const listeners = [
        ...events.get(eventName)
    ];

    listeners.forEach(callback => {

        /*
            The listener may have been removed
            after the snapshot was created.

            Do not execute it if it is no longer
            registered.
        */

        const currentList = events.get(eventName);

        if (
            !currentList ||
            !currentList.includes(callback)
        ) {
            return;
        }

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

    if (
        typeof eventName !== "string" ||
        !eventName.trim()
    ) {
        console.warn(
            "[EVENT] Invalid event name:",
            eventName
        );

        return () => {};
    }

    if (typeof callback !== "function") {

        console.warn(
            "[EVENT] Invalid callback for:",
            eventName
        );

        return () => {};
    }

    function wrapper(data) {

        /*
            Remove FIRST.

            This is important if the callback
            itself triggers the same event.
        */

        off(eventName, wrapper);

        try {

            callback(data);

        } catch (error) {

            console.error(
                "[EVENT ERROR]",
                eventName,
                error
            );

        }

    }

    return on(
        eventName,
        wrapper
    );

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
