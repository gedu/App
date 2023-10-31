import {deepEqual} from 'fast-equals';
import {atom, useAtom} from 'jotai';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import withCurrentReportID from '@components/withCurrentReportID';
import withNavigationFocus from '@components/withNavigationFocus';
import * as OnyxExtends from '@hooks/onyxBridge/onyxExtends';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import * as SessionUtils from '@libs/SessionUtils';
import SidebarUtils from '@libs/SidebarUtils';
import reportPropTypes from '@pages/reportPropTypes';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SidebarLinks, {basePropTypes} from './SidebarLinks';

const propTypes = {
    ...basePropTypes,

    /* Onyx Props */
    /** List of reports */
    chatReports: PropTypes.objectOf(reportPropTypes),

    /** All report actions for all reports */
    allReportActions: PropTypes.objectOf(
        PropTypes.arrayOf(
            PropTypes.shape({
                error: PropTypes.string,
                message: PropTypes.arrayOf(
                    PropTypes.shape({
                        moderationDecision: PropTypes.shape({
                            decision: PropTypes.string,
                        }),
                    }),
                ),
            }),
        ),
    ),

    /** Whether the reports are loading. When false it means they are ready to be used. */
    isLoadingReportData: PropTypes.bool,

    /** The chat priority mode */
    priorityMode: PropTypes.string,

    /** Beta features list */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** The policies which the user has access to */
    // eslint-disable-next-line react/forbid-prop-types
    policies: PropTypes.object,
};

const defaultProps = {
    chatReports: {},
    allReportActions: {},
    isLoadingReportData: true,
    priorityMode: CONST.PRIORITY_MODE.DEFAULT,
    betas: [],
    policies: {},
};

const chatReportsAtom = atom((get) => {
    const chatReports = get(OnyxExtends.chatReportsAtom);
    if (!chatReports) {
        return {};
    }
    return chatReports;
});

const allReportActionsTransformAtom = atom((get) => {
    const allReportActions = get(OnyxExtends.allReportActionsAtom);
    if (!allReportActions) {
        return {};
    }
    return _.reduce(
        _.map(allReportActions, (reportAction) => {
            // console.log('>>> report: ', reportAction);
            const obj = {};
            obj[`reportActions_${Object.keys(reportAction)[0]}`] = {
                errors: lodashGet(reportAction, 'errors', []),
                message: [
                    {
                        moderationDecision: {decision: lodashGet(reportAction, 'message[0].moderationDecision.decision')},
                    },
                ],
            };
            return obj;
        }),
        (memo, item) => {
            console.log('>>> item: ', item);
            return {...memo, ...item};
        },
        {},
    );
});

function SidebarLinksData({isFocused, allReportActions, currentReportID, insets, isLoadingReportData, onLinkClick}) {
    const {translate} = useLocalize();
    const [chatReports] = useAtom(chatReportsAtom);
    const [priorityMode] = useAtom(OnyxExtends.priorityModeAtom);
    const [betas] = useAtom(OnyxExtends.betasAtom);
    const [policies] = useAtom(OnyxExtends.policiesAtom);
    // const [allReportActionsAtom] = useAtom(allReportActionsTransformAtom);
    // console.log('allReportActionsAtom: ', allReportActionsAtom);
    // console.log('allReportActions: ', allReportActions);
    const reportIDsRef = useRef(null);
    const isLoading = SessionUtils.didUserLogInDuringSession() && isLoadingReportData;
    const optionListItems = useMemo(() => {
        const reportIDs = SidebarUtils.getOrderedReportIDs(null, chatReports, betas, policies, priorityMode, allReportActions);
        if (deepEqual(reportIDsRef.current, reportIDs)) {
            return reportIDsRef.current;
        }

        // We need to update existing reports only once while loading because they are updated several times during loading and causes this regression: https://github.com/Expensify/App/issues/24596#issuecomment-1681679531
        if (!isLoading || !reportIDsRef.current) {
            reportIDsRef.current = reportIDs;
        }
        return reportIDsRef.current || [];
    }, [allReportActions, betas, chatReports, policies, priorityMode, isLoading]);

    // We need to make sure the current report is in the list of reports, but we do not want
    // to have to re-generate the list every time the currentReportID changes. To do that
    // we first generate the list as if there was no current report, then here we check if
    // the current report is missing from the list, which should very rarely happen. In this
    // case we re-generate the list a 2nd time with the current report included.
    const optionListItemsWithCurrentReport = useMemo(() => {
        if (currentReportID && !_.contains(optionListItems, currentReportID)) {
            return SidebarUtils.getOrderedReportIDs(currentReportID, chatReports, betas, policies, priorityMode, allReportActions);
        }
        return optionListItems;
    }, [currentReportID, optionListItems, chatReports, betas, policies, priorityMode, allReportActions]);

    const currentReportIDRef = useRef(currentReportID);
    currentReportIDRef.current = currentReportID;
    const isActiveReport = useCallback((reportID) => currentReportIDRef.current === reportID, []);

    return (
        <View
            accessibilityElementsHidden={!isFocused}
            accessibilityLabel={translate('sidebarScreen.listOfChats')}
            style={[styles.flex1, styles.h100]}
        >
            <SidebarLinks
                // Forwarded props:
                insets={insets}
                priorityMode={priorityMode}
                // Data props:
                isActiveReport={isActiveReport}
                isLoading={isLoading}
                optionListItems={optionListItemsWithCurrentReport}
                onLinkClick={onLinkClick}
            />
        </View>
    );
}

SidebarLinksData.propTypes = propTypes;
SidebarLinksData.defaultProps = defaultProps;
SidebarLinksData.displayName = 'SidebarLinksData';

/**
 * @param {Object} [reportActions]
 * @returns {Object|undefined}
 */
const reportActionsSelector = (reportActions) =>
    reportActions &&
    _.map(reportActions, (reportAction) => {
        return {
            errors: lodashGet(reportAction, 'errors', []),
            message: [
                {
                    moderationDecision: {decision: lodashGet(reportAction, 'message[0].moderationDecision.decision')},
                },
            ],
        };
    });

/**
 * @param {Object} [policy]
 * @returns {Object|undefined}
 */
const policySelector = (policy) =>
    policy && {
        type: policy.type,
        name: policy.name,
        avatar: policy.avatar,
    };

export default compose(
    withCurrentReportID,
    withNavigationFocus,
    withOnyx({
        isLoadingReportData: {
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
        },
        allReportActions: {
            key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            selector: reportActionsSelector,
        },
    }),
)(SidebarLinksData);
