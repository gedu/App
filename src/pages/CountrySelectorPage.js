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
            country: PropTypes.string,
        }),
    }).isRequired,

    ...withLocalizePropTypes,
};

const greenCheckmark = {src: Expensicons.Checkmark, color: themeColors.success};

function filterCountries(searchValue, countries) {
    const trimmedSearchValue = searchValue.trim();
    if (trimmedSearchValue.length === 0) {
        return [];
    }

    return _.filter(countries, country => country.text.toLowerCase().includes(searchValue.toLowerCase()));
}

function CountrySelectorPage(props) {
    const [searchValue, setSearchValue] = useState('');
    const translate = props.translate;
    const route = props.route;
    const currentCountry = lodashGet(props.privatePersonalDetails, 'address.address.country') || route.params.countryISO;

    const countries = useMemo(() => _.map(translate('allCountries'), (countryName, countryISO) => ({
        value: countryISO,
        keyForList: countryISO,
        text: countryName,
        customIcon: currentCountry === countryISO ? greenCheckmark : undefined,
    })), [translate, currentCountry]);

    const updateCountry = useCallback((selectedCountry) => {
        Navigation.navigate(`${route.params.backTo}?countryISO=${selectedCountry.value}`);
    }, [route]);

    const filteredCountries = filterCountries(searchValue, countries);
    const headerMessage = searchValue.trim() && !filteredCountries.length ? translate('common.noResultsFound') : '';

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            {({safeAreaPaddingBottomStyle}) => (
                <>
                    <HeaderWithCloseButton
                        title={translate('common.country')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(`${route.params.backTo}`)}
                        onCloseButtonPress={() => Navigation.dismissModal(true)}
                    />
                    <OptionsSelector
                        textInputLabel={translate('common.country')}
                        placeholderText={translate('pronounsPage.placeholderText')}
                        headerMessage={headerMessage}
                        sections={[{data: filteredCountries, indexOffset: 0}]}
                        value={searchValue}
                        onSelectRow={updateCountry}
                        onChangeText={setSearchValue}
                        optionHoveredStyle={styles.hoveredComponentBG}
                        safeAreaPaddingBottomStyle={safeAreaPaddingBottomStyle}
                        shouldFocusOnSelectRow
                        shouldHaveOptionSeparator
                        initiallyFocusedOptionKey={currentCountry}
                    />
                </>
            )}
        </ScreenWrapper>
    );
}

CountrySelectorPage.propTypes = propTypes;
CountrySelectorPage.displayName = 'CountrySelectorPage';

export default compose(withLocalize, withCurrentUserPersonalDetails)(CountrySelectorPage);
