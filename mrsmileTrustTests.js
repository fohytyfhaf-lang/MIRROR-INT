
/* ==========================================================
   MR.SMILE TRUST — EVENT TESTS
   OMEGA / MIRROR-INT

   PURPOSE
   ----------------------------------------------------------
   Development / debugging tests for:

       mrsmile:trustChanged
       mrsmile:trustLevelChanged

   IMPORTANT:

   This file does NOT change Trust logic.

   It only:
   - subscribes to Trust events
   - records what happened
   - runs controlled tests
   - restores the original Trust value

   USE FROM CONSOLE:

       MRSMILE_TRUST_TESTS.run()

   Or:

       window.runMrSmileTrustTests()

========================================================== */

import {
    on
} from "./eventManager.js";

import {
    getTrust,
    setTrust,
    addTrust,
    resetTrust,
    getTrustLevelId
} from "./mrsmileTrust.js";


/* ==========================================================
   TEST STATE
========================================================== */

const STATE = {

    registered:
        false,

    trustEvents: [],

    levelEvents: []

};


/* ==========================================================
   ASSERTION
========================================================== */

function assert(
    condition,
    message
) {

    if (!condition) {

        throw new Error(
            message
        );

    }

}


/* ==========================================================
   SAFE EVENT REGISTRATION
========================================================== */

function registerListeners() {

    if (
        STATE.registered
    ) {

        return;

    }

    STATE.registered =
        true;


    on(
        "mrsmile:trustChanged",
        data => {

            STATE.trustEvents.push(
                {
                    ...data
                }
            );

        }
    );


    on(
        "mrsmile:trustLevelChanged",
        data => {

            STATE.levelEvents.push(
                {
                    ...data
                }
            );

        }
    );

}


/* ==========================================================
   CLEAR EVENT BUFFER
========================================================== */

function clearEvents() {

    STATE.trustEvents = [];

    STATE.levelEvents = [];

}


/* ==========================================================
   WAIT
========================================================== */

function wait(ms = 20) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


/* ==========================================================
   TEST 1
   REAL TRUST CHANGE
========================================================== */

async function testRealTrustChange() {

    clearEvents();

    setTrust(0);

    clearEvents();

    const result =
        addTrust(
            10,
            "TEST_REAL_CHANGE"
        );

    await wait();

    assert(
        result === 10,
        "Trust should become 10."
    );

    assert(
        STATE.trustEvents.length === 1,
        "Expected exactly one trustChanged event."
    );

    const event =
        STATE.trustEvents[0];

    assert(
        event.previous === 0,
        "previous should be 0."
    );

    assert(
        event.current === 10,
        "current should be 10."
    );

    assert(
        event.difference === 10,
        "difference should be 10."
    );

    assert(
        event.reason === "TEST_REAL_CHANGE",
        "reason should match the test reason."
    );

    return true;

}


/* ==========================================================
   TEST 2
   NO-OP addTrust(0)
========================================================== */

async function testZeroTrustChange() {

    clearEvents();

    const before =
        getTrust();

    const result =
        addTrust(
            0,
            "TEST_ZERO_CHANGE"
        );

    await wait();

    assert(
        result === before,
        "addTrust(0) must not change Trust."
    );

    assert(
        STATE.trustEvents.length === 0,
        "addTrust(0) must not emit trustChanged."
    );

    return true;

}


/* ==========================================================
   TEST 3
   SET SAME VALUE
========================================================== */

async function testSameValueSet() {

    clearEvents();

    const before =
        getTrust();

    const result =
        setTrust(
            before
        );

    await wait();

    assert(
        result === before,
        "setTrust(same value) should keep Trust unchanged."
    );

    assert(
        STATE.trustEvents.length === 0,
        "setTrust(same value) must not emit trustChanged."
    );

    assert(
        STATE.levelEvents.length === 0,
        "setTrust(same value) must not emit trustLevelChanged."
    );

    return true;

}


/* ==========================================================
   TEST 4
   TRUST LEVEL CHANGE
========================================================== */

async function testTrustLevelChange() {

    clearEvents();

    setTrust(29);

    clearEvents();

    const beforeLevel =
        getTrustLevelId();

    assert(
        beforeLevel === 2,
        "29 Trust should be INTERESTING."
    );

    setTrust(
        30
    );

    await wait();

    assert(
        STATE.trustEvents.length === 1,
        "29 → 30 should emit one trustChanged event."
    );

    assert(
        STATE.levelEvents.length === 1,
        "29 → 30 should emit one trustLevelChanged event."
    );

    const trustEvent =
        STATE.trustEvents[0];

    assert(
        trustEvent.previous === 29,
        "Level test previous Trust should be 29."
    );

    assert(
        trustEvent.current === 30,
        "Level test current Trust should be 30."
    );

    const levelEvent =
        STATE.levelEvents[0];

    assert(
        levelEvent.previous.id === 2,
        "Previous level should be INTERESTING."
    );

    assert(
        levelEvent.current.id === 3,
        "Current level should be TRUSTED."
    );

    assert(
        levelEvent.previousTrust === 29,
        "previousTrust should be 29."
    );

    assert(
        levelEvent.trust === 30,
        "trust should be 30."
    );

    return true;

}


/* ==========================================================
   TEST 5
   NO LEVEL CHANGE
========================================================== */

async function testNoLevelChange() {

    clearEvents();

    setTrust(31);

    clearEvents();

    setTrust(
        32
    );

    await wait();

    assert(
        STATE.trustEvents.length === 1,
        "31 → 32 should emit one trustChanged event."
    );

    assert(
        STATE.levelEvents.length === 0,
        "31 → 32 must not emit trustLevelChanged."
    );

    return true;

}


/* ==========================================================
   TEST 6
   CLAMPING
========================================================== */

async function testClamping() {

    clearEvents();

    setTrust(0);

    clearEvents();

    const result =
        setTrust(
            500
        );

    await wait();

    assert(
        result === 100,
        "Trust must be clamped to 100."
    );

    assert(
        STATE.trustEvents.length === 1,
        "0 → 100 should emit one trustChanged event."
    );

    clearEvents();

    setTrust(
        -500
    );

    await wait();

    assert(
        getTrust() === -100,
        "Trust must be clamped to -100."
    );

    assert(
        STATE.trustEvents.length === 1,
        "100 → -100 should emit one trustChanged event."
    );

    return true;

}


/* ==========================================================
   TEST 7
   RESET
========================================================== */

async function testReset() {

    setTrust(25);

    clearEvents();

    const result =
        resetTrust();

    await wait();

    assert(
        result === 0,
        "resetTrust() should return 0."
    );

    assert(
        STATE.trustEvents.length === 1,
        "Reset from non-zero should emit one trustChanged event."
    );

    const event =
        STATE.trustEvents[0];

    assert(
        event.previous === 25,
        "Reset previous should be 25."
    );

    assert(
        event.current === 0,
        "Reset current should be 0."
    );

    assert(
        event.difference === -25,
        "Reset difference should be -25."
    );

    assert(
        event.reason === "RESET",
        "Reset reason should be RESET."
    );

    return true;

}


/* ==========================================================
   TEST 8
   REPEATED RESET
========================================================== */

async function testRepeatedReset() {

    clearEvents();

    setTrust(0);

    clearEvents();

    const result =
        resetTrust();

    await wait();

    assert(
        result === 0,
        "Repeated reset should remain at 0."
    );

    assert(
        STATE.trustEvents.length === 0,
        "Resetting 0 → 0 must not emit trustChanged."
    );

    assert(
        STATE.levelEvents.length === 0,
        "Resetting 0 → 0 must not emit trustLevelChanged."
    );

    return true;

}


/* ==========================================================
   TEST 9
   REVERSE LEVEL CHANGE
========================================================== */

async function testReverseLevelChange() {

    clearEvents();

    setTrust(80);

    clearEvents();

    setTrust(79);

    await wait();

    assert(
        STATE.trustEvents.length === 1,
        "80 → 79 should emit one trustChanged event."
    );

    assert(
        STATE.levelEvents.length === 1,
        "80 → 79 should emit one trustLevelChanged event."
    );

    assert(
        STATE.levelEvents[0].previous.id === 5,
        "Previous level should be FRIEND."
    );

    assert(
        STATE.levelEvents[0].current.id === 4,
        "Current level should be ALLY."
    );

    return true;

}


/* ==========================================================
   TEST SUITE
========================================================== */

export async function runMrSmileTrustTests() {

    registerListeners();


    const originalTrust =
        getTrust();


    const results = [];


    try {

        /*
         * Basic events
         */

        results.push({
            name:
                "real Trust change",

            passed:
                await testRealTrustChange()
        });


        /*
         * No-op protection
         */

        results.push({
            name:
                "addTrust(0) no event",

            passed:
                await testZeroTrustChange()
        });


        results.push({
            name:
                "setTrust(same value) no event",

            passed:
                await testSameValueSet()
        });


        /*
         * Level transitions
         */

        results.push({
            name:
                "Trust level change",

            passed:
                await testTrustLevelChange()
        });


        results.push({
            name:
                "Trust change without level change",

            passed:
                await testNoLevelChange()
        });


        /*
         * Limits
         */

        results.push({
            name:
                "Trust clamping",

            passed:
                await testClamping()
        });


        /*
         * Reset
         */

        results.push({
            name:
                "reset Trust event",

            passed:
                await testReset()
        });


        results.push({
            name:
                "repeated reset no event",

            passed:
                await testRepeatedReset()
        });


        /*
         * Reverse transition
         */

        results.push({
            name:
                "reverse level change",

            passed:
                await testReverseLevelChange()
        });


        return {
            ok:
                true,

            passed:
                results.length,

            failed:
                0,

            results,

            finalTrust:
                getTrust(),

            originalTrust

        };

    } catch (error) {

        return {

            ok:
                false,

            passed:
                results.filter(
                    result =>
                        result.passed
                ).length,

            failed:
                1,

            results,

            error:
                error.message,

            finalTrust:
                getTrust(),

            originalTrust

        };

    } finally {

        /*
         * Always restore the user's original Trust.
         */

        clearEvents();

        setTrust(
            originalTrust
        );

        clearEvents();

    }

}


/* ==========================================================
   EVENT BUFFER
========================================================== */

export function getTrustTestEvents() {

    return {

        trustChanged:
            STATE.trustEvents.map(
                event => ({
                    ...event
                })
            ),

        trustLevelChanged:
            STATE.levelEvents.map(
                event => ({
                    ...event
                })
            )

    };

}


/* ==========================================================
   GLOBAL API
========================================================== */

const API = {

    run:
        runMrSmileTrustTests,

    events:
        getTrustTestEvents

};


if (
    typeof window !==
    "undefined"
) {

    window.MRSMILE_TRUST_TESTS =
        API;

    window.runMrSmileTrustTests =
        runMrSmileTrustTests;

}


/* ==========================================================
   DEFAULT EXPORT
========================================================== */

export default API;

