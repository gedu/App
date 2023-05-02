import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useCallback, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import withCurrentUserPersonalDetails from '../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../components/ScreenWrapper';
import HeaderWithCloseButton from '../components/HeaderWithCloseButton';
import Navigation from '../libs/Navigation/Navigation';
import * as Expensicons from '../components/Icon/Expensicons';
import themeColors from '../styles/themes/default';
import OptionsSelector from '../components/OptionsSelector';
import styles from '../styles/styles';
import compose from '../libs/compose';

const propTypes = {
    route: PropTypes.shape({
        params: PropTypes.shape({
            backTo: PropTypes.string,
        }),
    }).isRequired,

    /** User's private personal details */
    currentUserPersonalDetails: PropTypes.shape({
        /** User's home address */
        address: PropTypes.shape({
            state: PropTypes.string,
        }),
    }).isRequired,

    ...withLocalizePropTypes,
};

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

function filterCountryStates(searchValue, countryStates) {
    const trimmedSearchValue = searchValue.trim();
    if (trimmedSearchValue.length === 0) {
        return [];
    }

    return _.filter(countryStates, state => state.text.toLowerCase().includes(searchValue.toLowerCase()));
}

function StateSelectorPage(props) {
    const [searchValue, setSearchValue] = useState('');
    const translate = props.translate;
    const route = props.route;
    const currentCountryState = lodashGet(props.privatePersonalDetails, 'address.address.state') || route.params.stateISO;

    const countryStates = useMemo(() => _.map(translate('allStates'), state => ({
        value: state.stateISO,
        keyForList: state.stateISO,
        text: state.stateName,
        customIcon: currentCountryState === state.stateISO ? greenCheckmark : undefined,
    })), [translate, currentCountryState]);

    const updateCountryState = useCallback((selectedState) => {
        Navigation.navigate(`${route.params.backTo}?stateName=${selectedState.text}&stateISO=${selectedState.value}`);
    }, [route]);

    const filteredCountryStates = filterCountryStates(searchValue, countryStates);
    const headerMessage = searchValue.trim() && !filteredCountryStates.length ? translate('common.noResultsFound') : '';

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithCloseButton
                        title={translate('common.state')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(`${route.params.backTo}`)}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <OptionsSelector
                        textInputLabel={translate('common.state')}
                        placeholderText={translate('pronounsPage.placeholderText')}
                        headerMessage={headerMessage}
                        sections={[{data: filteredCountryStates, indexOffset: 0}]}
                        value={searchValue}
                        onSelectRow={updateCountryState}
                        onChangeText={setSearchValue}
                        optionHoveredStyle={styles.hoveredComponentBG}
                        safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                        shouldFocusOnSelectRow
                        shouldHaveOptionSeparator
                        initiallyFocusedOptionKey={currentCountryState}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

StateSelectorPage.propTypes = propTypes;
StateSelectorPage.displayName = 'StateSelectorPage';

export default compose(withLocalize, withCurrentUserPersonalDetails)(StateSelectorPage);
