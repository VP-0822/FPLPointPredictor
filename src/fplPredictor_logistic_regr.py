from componentAnalysis import X_train_reduced, X_test_reduced, y_train, y_test
from sklearn.linear_model import LogisticRegression
import numpy as np

logisticRegr = LogisticRegression(solver = 'lbfgs', multi_class='multinomial',max_iter=500)

logisticRegr.fit(X_train_reduced, y_train.ravel())

y_pred = logisticRegr.predict(X_test_reduced)
print(np.unique(y_train))
print(np.unique(y_test))
print(np.unique(y_pred))

print(logisticRegr.score(X_test_reduced, y_test))