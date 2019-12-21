import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.decomposition import PCA
import time

# STEP 1 : Create feature and target matrix
df = pd.read_csv("../data/fixtureWiseData_for_regression.csv")

features = ['match_difficulty', 'was_home_match', 'player_team_relavent_avg_goals', 'opponent_team_relavent_avg_goals',
            'player_team_avg_goals', 'opponent_team_avg_goals', 'played_minutes', 'avg_goal_scored',
            'avg_assists', 'avg_clean_sheets', 'avg_goals_conceded', 'avg_own_goals',
            'avg_penalties_saved', 'avg_penalties_missed', 'total_yellow_cards', 'total_red_cards',
            'avg_saves', 'avg_bonus', 'avg_bps', 'ict_index_score_prev_match',
            'avg_points_per_match'
            ]

# Descriptive statistics for each column
#print(df.describe())

X = df.loc[:, features].values
y = df.loc[:,['points']].values

# STEP 2 : Scaling of features

# Opt 1 : Standardizing the features (Use for Logistic regression)
#X_scaled = StandardScaler().fit_transform(X)

# Opt 2 : MinMax Scaling of the features (Use for RandomForest and SVR)
X_scaled = MinMaxScaler().fit_transform(X)

# STEP 3 : Split data into training and testing sets
millis = int(round(time.time() * 1000)) % 1000000

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.3, random_state=millis)

# STEP 4 : Dimention reductionality using PCA
pca = PCA(0.95)

principalComponents = pca.fit(X_train)
X_train_reduced = pca.transform(X_train)
X_test_reduced = pca.transform(X_test)

#print(pca.explained_variance_ratio_)
print('Number of components used : ' + str(pca.n_components_))