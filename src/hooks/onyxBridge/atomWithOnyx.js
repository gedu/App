import {atom} from 'jotai';
import Onyx from 'react-native-onyx';

function connectWithOnyx(key, setAtom, options) {
    // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
    return Onyx.connect({
        key,
        ...options,
        callback: (newValue) => {
            // console.log('atomWithOnyx callback: ', key, newValue);
            if (!newValue) {
                // TODO: maybe this can be optional, for now ignoring all
                return;
            }
            setAtom(newValue);
        },
    });
}

export default function atomWithOnyx(key, initialValue, options = {}) {
    const baseAtom = atom(initialValue);

    baseAtom.onMount = (setAtom) => {
        // console.log('atomWithOnyx onMount: ', key);
        const unsubscribeID = connectWithOnyx(key, setAtom, options);
        return () => {
            Onyx.disconnect(unsubscribeID);
        };
    };

    const derivedAtom = atom((get) => get(baseAtom));

    return derivedAtom;
}
