import React, {
    useCallback, useRef, useEffect,
} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import * as PersonalDetails from '../libs/actions/PersonalDetails';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import FormHelpMessage from './FormHelpMessage';

const propTypes = {
    /** The ISO code of the country */
    countryISO: PropTypes.string,

    /** The ISO selected from CountrySelector */
    selectedCountryISO: PropTypes.string,

    /** Form Error description */
    errorText: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    countryISO: '',
    selectedCountryISO: undefined,
    errorText: '',
};

function BaseCountryPicker(props) {
    const countryTitle = useRef({title: '', iso: ''});
    const countryISO = props.countryISO;
    const selectedCountryISO = props.selectedCountryISO;
    const onInputChange = props.onInputChange;

    useEffect(() => {
        console.log('selectedCountryISO', selectedCountryISO, countryTitle.current);
        if (!selectedCountryISO || selectedCountryISO === countryTitle.current.iso) {
            return;
        }
        countryTitle.current = {title: PersonalDetails.getCountryNameBy(selectedCountryISO || countryISO), iso: selectedCountryISO || countryISO};
        onInputChange(countryTitle.current.title);
    },
    [countryISO, selectedCountryISO, onInputChange]);

    const navigateToCountrySelector = useCallback(() => {
        Navigation.navigate(ROUTES.getCountrySelectionRoute(selectedCountryISO || countryISO, Navigation.getActiveRoute()));
    }, [countryISO, selectedCountryISO]);

    return (
        <View>
            <MenuItemWithTopDescription
                ref={props.forwardedRef}
                shouldShowRightIcon
                title={countryTitle.current.title}
                description={props.translate('common.country')}
                onPress={navigateToCountrySelector}
            />
            <FormHelpMessage message={props.errorText} />
        </View>

    );
}

BaseCountryPicker.propTypes = propTypes;
BaseCountryPicker.defaultProps = defaultProps;

const CountryPicker = React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseCountryPicker {...props} forwardedRef={ref} />
));

CountryPicker.displayName = 'CountryPicker';

export default withLocalize(CountryPicker);
