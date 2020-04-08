import React, { useState, useEffect } from 'react';
import { object } from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';

import { KeyInfo, KeySharing, KeyUsage } from '../CreateKey/components';

import { useDispatch, useSelector } from 'react-redux';
import { usersSelector, FETCH_USERS } from 'state/modules/app/users/actions';
import { updateKeySaga } from 'state/modules/app/keys/actions';

import { Selectors } from 'state/modules/app/keys';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    padding: theme.spacing(3)
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
}));

function getSteps() {
  return ['Fill key information', 'Define key sharing', 'Define key usage'];
}

export default function EditKey(props) {
  const classes = useStyles();
  const usersStore = useSelector(usersSelector);
  const dispatch = useDispatch();

  const allUsers = Object.values(usersStore.byId);
  console.log('status', usersStore.status);
  const keyId = props.match.params;
  const edittingKey = useSelector(state => Selectors.getKeyById(state, keyId));
  const { alias, description, rotation, permissions } = edittingKey;
  const selectedUserArr = Object.keys(permissions);
  const selectedUserIdx = selectedUserArr.map(userId => usersStore.allIds.indexOf(userId));
  console.log('selectedUserIdx', selectedUserIdx);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedUsers, setselectedUsers] = useState(selectedUserIdx);
  console.log('selectedUsers', selectedUsers);

  const [keyInfo, setKeyInfo] = useState({
    alias,
    description,
    rotation,
    permissions
  })

  const steps = getSteps();

  useEffect(() => {
    usersStore.status !== 'LOADED' && dispatch({ type: FETCH_USERS });
    console.log('run effect');

    setselectedUsers(selectedUserIdx);
  }, [usersStore.status])

  // handld functions
  const handleKeyInfo = (e) => {
    e.persist();
    setKeyInfo(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSelectRotate = (value) => {
    setKeyInfo(prev => ({
      ...prev,
      rotation: value
    }))
  }
  const handleSelectUsers = (selectedUserIdxs) => {
    setselectedUsers(selectedUserIdxs);
  }
  const handleKeyUsage = (selectedPermissions, userId) => {
    setKeyInfo(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [userId]: [...selectedPermissions]
      }
    }))
  }

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <KeyInfo
            keyInfo={keyInfo}
            onChange={handleKeyInfo}
            onSelect={handleSelectRotate}
          />
        );
      case 1:
        return (
          <KeySharing
            allUsers={allUsers}
            onChange={handleSelectUsers}
            selectedUsers={selectedUsers}
          />
        );
      case 2:
        return (
          <KeyUsage
            keyInfo={keyInfo}
            onChange={handleKeyUsage}
            selectedUsers={selectedUsers.map(idx => allUsers[idx])}
          />
        );
      default:
        return 'Unknown step';
    }
  }

  const handleNext = () => {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleFinish = () => {
    setActiveStep(0);
    dispatch(updateKeySaga({ ...edittingKey, ...keyInfo }));
  }
  return (
    <div className={classes.root}>
      <Stepper
        activeStep={activeStep}
        orientation="vertical"
      >
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
            <StepContent>
              {getStepContent(index)}
              <div className={classes.actionsContainer}>
                <div>
                  <Button
                    className={classes.button}
                    disabled={activeStep === 0}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  <Button
                    className={classes.button}
                    color="primary"
                    onClick={handleNext}
                    variant="contained"
                  >
                    {activeStep === steps.length - 1 ? 'Update' : 'Next'}
                  </Button>
                </div>
              </div>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && handleFinish()}
    </div>
  );
}
EditKey.propTypes = {
  match: object.isRequired
}