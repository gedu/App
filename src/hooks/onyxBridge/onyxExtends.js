import {atomFamily, selectAtom} from 'jotai/utils';
import {useCallback} from 'react';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import atomWithOnyx from './atomWithOnyx';

const isSidebarLoadedAtom = atomWithOnyx(ONYXKEYS.IS_SIDEBAR_LOADED, false);
const reportActionsAtomFamily = atomFamily((id) => atomWithOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${id}`, {}));
const reportAtomFamily = atomFamily((id) => atomWithOnyx(`${ONYXKEYS.COLLECTION.REPORT}${id}`, {}));
const reportMetadataAtomFamily = atomFamily((id) =>
    atomWithOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${id}`, {
        isLoadingInitialReportActions: true,
        isLoadingOlderReportActions: false,
        isLoadingNewerReportActions: false,
    }),
);
const isComposerFullSizeAtomFamily = atomFamily((id) => atomWithOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${id}`, false));
const betasAtom = atomWithOnyx(ONYXKEYS.BETAS, {});
const policiesAtom = atomWithOnyx(ONYXKEYS.COLLECTION.POLICY, {}, {allowStaleData: true, waitForCollectionCallback: true});
const accountManagerReportIdAtom = atomWithOnyx(ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID, null);
const personalDetailsAtom = atomWithOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, null);
const userLeavingStatusAtom = atomFamily((id) => atomWithOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${id}`, false));
const sessionAtom = atomWithOnyx(ONYXKEYS.SESSION, {});
const chatReportsAtom = atomWithOnyx(ONYXKEYS.COLLECTION.REPORT, {}, {waitForCollectionCallback: true});
const isLoadingReportDataAtom = atomWithOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, false); // not fully working?
const priorityModeAtom = atomWithOnyx(ONYXKEYS.NVP_PRIORITY_MODE, CONST.PRIORITY_MODE.DEFAULT);
const allReportActionsAtom = atomWithOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {}, {waitForCollectionCallback: true});
// const userLeavingStatusAtom = atomWithOnyx(ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM, {});

function useSelectOnyxAtomById(collectionAtom, id) {
    return selectAtom(
        collectionAtom,
        useCallback((collection) => collection[id], [id]),
    );
}

export {
    useSelectOnyxAtomById,
    isSidebarLoadedAtom,
    reportActionsAtomFamily,
    reportAtomFamily,
    reportMetadataAtomFamily,
    isComposerFullSizeAtomFamily,
    betasAtom,
    policiesAtom,
    accountManagerReportIdAtom,
    personalDetailsAtom,
    userLeavingStatusAtom, // make it family
    sessionAtom,
    chatReportsAtom,
    isLoadingReportDataAtom,
    priorityModeAtom,
    allReportActionsAtom,
    // userLeavingStatusAtom,
};
