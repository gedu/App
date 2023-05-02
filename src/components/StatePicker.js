import lodashGet from 'lodash/get';
import React, {useState, useEffect, useCallback} from 'react';
import {View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import FormHelpMessage from './FormHelpMessage';

const propTypes = {
    /** Current State from user address  */
    stateISO: PropTypes.string,

    /** Error text to display */
    errorText: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    stateISO: '',
    errorText: '',
};

function BaseStatePicker(props) {
    const route = useRoute();
    const [stateTitle, setStateTitle] = useState('');
    const selectedStateName = lodashGet(route, 'params.stateName');
    const selectedStateISO = lodashGet(route, 'params.stateISO');
    const stateISO = props.stateISO;
    const onInputChange = props.onInputChange;
    const defaultValue = props.defaultValue;

    useEffect(() => {
        if (!selectedStateName || selectedStateName === stateTitle) {
            return;
        }

        setStateTitle(selectedStateName || stateISO);

        // Needed to call onInputChange, so Form can update the validation and values
        onInputChange(selectedStateISO);
    },
    [stateISO, selectedStateName, stateTitle, onInputChange, selectedStateISO]);

    useEffect(() => {
        console.log('stateDefault use effect: ', defaultValue);
    }, [defaultValue]);

    const navigateToCountrySelector = useCallback(() => {
        Navigation.navigate(ROUTES.getUsaStateSelectionRoute(selectedStateName || stateISO, Navigation.getActiveRoute()));
    }, [stateISO, selectedStateName]);

    return (
        <View>
            <MenuItemWithTopDescription
                ref={props.forwardedRef}
                wrapperStyle={styles.ph0}
                shouldShowRightIcon
                title={stateTitle || defaultValue}
                description={props.translate('common.state')}
                onPress={navigateToCountrySelector}
            />
            <FormHelpMessage message={props.errorText} />
        </View>

    );
}

BaseStatePicker.propTypes = propTypes;
BaseStatePicker.defaultProps = defaultProps;

const StatePicker = React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <BaseStatePicker {...props} forwardedRef={ref} />
));

StatePicker.displayName = 'StatePicker';

export default withLocalize(StatePicker);
