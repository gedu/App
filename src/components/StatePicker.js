import lodashGet from 'lodash/get';
import React, {
    useState, useEffect, useCallback, useMemo,
} from 'react';
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

    /** Default value to display */
    defaultValue: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    stateISO: '',
    errorText: '',
    defaultValue: '',
};

function BaseStatePicker(props) {
    const route = useRoute();
    const stateISO = props.stateISO;
    const [stateTitle, setStateTitle] = useState(stateISO);
    const paramStateISO = lodashGet(route, 'params.stateISO');
    const onInputChange = props.onInputChange;
    const selectedStateISO = props.selectedStateISO;
    const defaultValue = props.defaultValue;
    const translate = props.translate;

    useEffect(() => {
        if (!paramStateISO || paramStateISO === stateTitle) {
            return;
        }

        setStateTitle(paramStateISO);

        // Needed to call onInputChange, so Form can update the validation and values
        onInputChange(paramStateISO);
    },
    [paramStateISO, stateTitle, onInputChange]);

    useEffect(() => {
        if (!selectedStateISO) {
            return;
        }
        setStateTitle(selectedStateISO);
    }, [selectedStateISO]);

    const navigateToCountrySelector = useCallback(() => {
        Navigation.navigate(ROUTES.getUsaStateSelectionRoute(paramStateISO || stateISO, Navigation.getActiveRoute()));
    }, [stateISO, paramStateISO]);

    const title = useMemo(() => {
        if (!stateTitle) {
            return defaultValue;
        }
        const allStates = translate('allStates');
        if (allStates[stateTitle]) {
            return allStates[stateTitle].stateName;
        }

        return stateTitle;
    }, [translate, stateTitle, defaultValue]);

    return (
        <View>
            <MenuItemWithTopDescription
                ref={props.forwardedRef}
                wrapperStyle={styles.ph0}
                shouldShowRightIcon
                title={title}
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
