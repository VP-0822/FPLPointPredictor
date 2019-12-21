from componentAnalysis import X_train_reduced, X_test_reduced, y_train, y_test
from sklearn.ensemble import RandomForestRegressor
import numpy as np
import time

millis = int(round(time.time() * 1000)) % 1000000
# Randomforest regressor with 1000 decision trees
rf_regr = RandomForestRegressor(n_estimators = 1000, random_state = millis)

# Train the model on training samples
rf_regr.fit(X_train_reduced, y_train.ravel())

# Predict on the test data
y_pred = rf_regr.predict(X_test_reduced)

y_pred = np.around(y_pred)
print(np.unique(y_train))
print(np.unique(y_test))
print(np.unique(y_pred))
accuracy = np.sum(y_pred == y_test.ravel())/ len(y_test.ravel())
print(accuracy)