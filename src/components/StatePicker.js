import lodashGet from 'lodash/get';
import React, {useState, useEffect, useCallback} from 'react';
import {View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import PropTypes from 'prop-types';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import Navigation from '../libs/Navigation/Navigation';
import ROUTES from '../ROUTES';
import FormHelpMessage from './FormHelpMessage';

const propTypes = {
    /** Current State from user address  */
    stateName: PropTypes.string,

    /** Error text to display */
    errorText: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    stateName: '',
    errorText: '',
};

function BaseStatePicker(props) {
    const route = useRoute();
    const [stateTitle, setStateTitle] = useState('');
    const selectedStateName = lodashGet(route, 'params.stateName');
    const stateName = props.stateName;
    const onInputChange = props.onInputChange;

    useEffect(() => {
        console.log('selectedStateName', selectedStateName, stateTitle);
        if (!selectedStateName || selectedStateName === stateTitle) {
            return;
        }

        setStateTitle(selectedStateName || stateName);
        onInputChange(selectedStateName || stateName);
    },
    [stateName, selectedStateName, stateTitle, onInputChange]);

    const navigateToCountrySelector = useCallback(() => {
        Navigation.navigate(ROUTES.getUsaStateSelectionRoute(selectedStateName || stateName, Navigation.getActiveRoute()));
    }, [stateName, selectedStateName]);

    return (
        <View>
            <MenuItemWithTopDescription
                ref={props.forwardedRef}
                shouldShowRightIcon
                title={stateTitle}
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
