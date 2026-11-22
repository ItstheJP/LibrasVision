import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

df = pd.read_csv("dados.csv", header=None)
y = df[0]
X = df.drop(columns=0)
print(y.value_counts().sort_index(), "\n")

X_tr, X_te, y_tr, y_te = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

modelo = RandomForestClassifier(n_estimators=300, random_state=42, n_jobs=-1)
modelo.fit(X_tr, y_tr)

print(classification_report(y_te, modelo.predict(X_te)))
joblib.dump(modelo, "modelo_libras.joblib")
print("Modelo salvo em modelo_libras.joblib")
