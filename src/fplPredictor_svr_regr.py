from componentAnalysis import X_train_reduced, X_test_reduced, y_train, y_test
from sklearn.svm import SVR
import numpy as np

# SVR using linear kernel
#svr_linear = SVR(kernel='linear', C=100, gamma='auto',verbose=True)
svr_rbf = SVR(kernel='rbf', C=100, gamma='auto', epsilon=.1,verbose=True)

# Train the model on training samples
#svr_linear.fit(X_train_reduced, y_train.ravel())
svr_rbf.fit(X_train_reduced, y_train.ravel())

# Predict on the test data
#y_pred = svr_linear.predict(X_test_reduced)
y_pred = svr_rbf.predict(X_test_reduced)

y_pred = np.around(y_pred)
y_pred = np.where(y_pred == -0,0,y_pred)
print(np.unique(y_train))
print(np.unique(y_test))
print(np.unique(y_pred))
accuracy = np.sum(y_pred == y_test.ravel())/ len(y_test.ravel())
print(accuracy)
