# ml-service/app/risk.py
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from typing import Dict, Any, Tuple, List
from .preprocessing import DEFAULT_STANDARDS

class WaterPlantRiskEngine:
    def __init__(self):
        # Initialize and fit models on baseline synthetic industrial water distribution
        self.isolation_forest = self._init_isolation_forest()
        self.classifier = self._init_classifier()

    def _init_isolation_forest(self) -> IsolationForest:
        """
        Fits an unsupervised Isolation Forest on 500 baseline nominal samples.
        Features: [ph, turbidity, tds, temperature, chlorine, flow_rate]
        """
        np.random.seed(42)
        nominal_samples = np.column_stack([
            np.random.normal(7.4, 0.25, 500),    # pH
            np.random.gamma(2, 0.6, 500),         # Turbidity (mean ~1.2 NTU)
            np.random.normal(320, 30, 500),      # TDS (ppm)
            np.random.normal(24, 2.5, 500),       # Temp (°C)
            np.random.normal(0.8, 0.2, 500),      # Chlorine (mg/L)
            np.random.normal(1200, 80, 500),     # Flow (L/min)
        ])
        
        iso = IsolationForest(contamination=0.05, random_state=42)
        iso.fit(nominal_samples)
        return iso

    def _init_classifier(self) -> RandomForestClassifier:
        """
        Fits a Random Forest Classifier for multi-class water quality categorization.
        Classes: 0 = GOOD, 1 = WARNING, 2 = CRITICAL
        """
        np.random.seed(42)
        # Generate representative dataset
        X_good = np.column_stack([
            np.random.normal(7.3, 0.2, 300),
            np.random.uniform(0.5, 2.5, 300),
            np.random.uniform(250, 450, 300),
            np.random.uniform(20, 28, 300),
            np.random.uniform(0.5, 1.5, 300),
            np.random.uniform(1000, 1500, 300)
        ])
        y_good = np.zeros(300)

        X_warn = np.column_stack([
            np.random.uniform(6.0, 6.4, 100),
            np.random.uniform(4.0, 7.5, 100),
            np.random.uniform(480, 700, 100),
            np.random.uniform(30, 35, 100),
            np.random.uniform(0.1, 0.3, 100),
            np.random.uniform(500, 900, 100)
        ])
        y_warn = np.ones(100)

        X_crit = np.column_stack([
            np.random.uniform(4.0, 5.5, 100),
            np.random.uniform(8.0, 18.0, 100),
            np.random.uniform(750, 1200, 100),
            np.random.uniform(36, 48, 100),
            np.random.uniform(0.0, 0.08, 100),
            np.random.uniform(50, 300, 100)
        ])
        y_crit = np.full(100, 2)

        X = np.vstack([X_good, X_warn, X_crit])
        y = np.concatenate([y_good, y_warn, y_crit])

        rf = RandomForestClassifier(n_estimators=50, random_state=42)
        rf.fit(X, y)
        return rf

    def evaluate(self, features_dict: Dict[str, Any]) -> Dict[str, Any]:
        ph = float(features_dict.get("ph", 7.0))
        turbidity = float(features_dict.get("turbidity", 1.0))
        tds = float(features_dict.get("tds", 300.0))
        temp = float(features_dict.get("temperature", 25.0))
        chlorine = float(features_dict.get("chlorine", 0.5))
        flow = float(features_dict.get("flow_rate", 1200.0))

        feat_array = np.array([[ph, turbidity, tds, temp, chlorine, flow]])

        # 1. Unsupervised Isolation Forest Anomaly Detection
        # score_samples returns negative anomaly score (lower means more anomalous)
        iso_score = float(self.isolation_forest.score_samples(feat_array)[0])
        iso_anomaly = bool(self.isolation_forest.predict(feat_array)[0] == -1)

        # 2. Supervised Random Forest Classifier Prediction
        rf_class_idx = int(self.classifier.predict(feat_array)[0])
        rf_probs = self.classifier.predict_proba(feat_array)[0]
        confidence = float(np.max(rf_probs) * 100.0)

        # 3. Deterministic Safety Rule Engine
        rule_violations = []
        factors = []
        rule_risk = 5.0

        # pH check
        if ph < DEFAULT_STANDARDS["ph_min"] or ph > DEFAULT_STANDARDS["ph_max"]:
            sev = "critical" if (ph < 6.0 or ph > 9.0) else "warning"
            rule_violations.append(f"pH level ({ph}) out of safety band")
            rule_risk += 35.0 if sev == "critical" else 20.0
            factors.append({
                "parameter": "pH",
                "impact_score": 85.0 if sev == "critical" else 45.0,
                "status": sev,
                "deviation": f"{'Acidic' if ph < 7.0 else 'Alkaline'} ({ph})"
            })
        else:
            factors.append({"parameter": "pH", "impact_score": 10.0, "status": "normal", "deviation": "Optimal"})

        # Turbidity check
        if turbidity > DEFAULT_STANDARDS["turbidity_max"]:
            sev = "critical" if turbidity > 8.0 else "warning"
            rule_violations.append(f"Turbidity ({turbidity} NTU) exceeds limit")
            rule_risk += 40.0 if sev == "critical" else 25.0
            factors.append({
                "parameter": "Turbidity",
                "impact_score": 95.0 if sev == "critical" else 55.0,
                "status": sev,
                "deviation": f"+{round(turbidity - DEFAULT_STANDARDS['turbidity_max'], 2)} NTU above safe limit"
            })
        else:
            factors.append({"parameter": "Turbidity", "impact_score": 5.0, "status": "normal", "deviation": "Clear"})

        # TDS check
        if tds > DEFAULT_STANDARDS["tds_max"]:
            sev = "critical" if tds > 750 else "warning"
            rule_violations.append(f"TDS ({tds} ppm) exceeds threshold")
            rule_risk += 25.0 if sev == "critical" else 15.0
            factors.append({
                "parameter": "TDS",
                "impact_score": 75.0 if sev == "critical" else 40.0,
                "status": sev,
                "deviation": f"+{int(tds - DEFAULT_STANDARDS['tds_max'])} ppm over ceiling"
            })
        else:
            factors.append({"parameter": "TDS", "impact_score": 8.0, "status": "normal", "deviation": "Nominal"})

        # Chlorine check
        if chlorine < DEFAULT_STANDARDS["chlorine_min"] or chlorine > DEFAULT_STANDARDS["chlorine_max"]:
            sev = "critical" if (chlorine < 0.1 or chlorine > 3.0) else "warning"
            rule_violations.append(f"Free chlorine ({chlorine} mg/L) out of specification")
            rule_risk += 30.0 if sev == "critical" else 15.0
            factors.append({
                "parameter": "Chlorine",
                "impact_score": 80.0 if sev == "critical" else 35.0,
                "status": sev,
                "deviation": f"{'Depleted' if chlorine < 0.2 else 'Excess'} ({chlorine} mg/L)"
            })
        else:
            factors.append({"parameter": "Chlorine", "impact_score": 6.0, "status": "normal", "deviation": "Residual Active"})

        # Flow / Pump
        if flow < 300:
            rule_violations.append(f"Restricted flow rate ({flow} L/min)")
            rule_risk += 35.0
            factors.append({
                "parameter": "Flow & Pump",
                "impact_score": 90.0,
                "status": "critical",
                "deviation": "Cavitation / valve blockage"
            })
        else:
            factors.append({"parameter": "Flow & Pump", "impact_score": 7.0, "status": "normal", "deviation": "Adequate"})

        # 4. Composite Risk Calculation
        # Risk (0-100) = w1*RuleRisk + w2*ML_Anomaly + w3*ClassifierProb
        ml_risk_component = 45.0 if iso_anomaly else 5.0
        rf_risk_component = 90.0 if rf_class_idx == 2 else (50.0 if rf_class_idx == 1 else 10.0)

        composite_risk = (0.50 * rule_risk) + (0.30 * ml_risk_component) + (0.20 * rf_risk_component)
        final_risk = min(100.0, max(0.0, composite_risk))

        # Overall Status Resolution
        if final_risk >= 70.0 or any(f["status"] == "critical" for f in factors):
            water_quality = "CRITICAL"
            prediction = "ABNORMAL"
            reason = f"Critical risk detected. Primary anomalies observed in: {', '.join(rule_violations) if rule_violations else 'Multi-variable drift'}."
            recommendation = "IMMEDIATE ACTION: Divert output line to secondary basin. Inspect filtration membranes, check coagulant dosing pumps, and inspect feed pump cavitation."
        elif final_risk >= 35.0 or len(rule_violations) > 0:
            water_quality = "WARNING"
            prediction = "ABNORMAL"
            reason = f"Elevated operational risk: {', '.join(rule_violations)}."
            recommendation = "Inspect chemical dosing pumps, check membrane differential pressure, and re-calibrate optical sensors."
        else:
            water_quality = "GOOD"
            prediction = "NORMAL"
            reason = "All major operational parameters are within safe and optimal operating limits."
            recommendation = "Continue automated continuous operations. Maintain standard sampling interval."

        return {
            "prediction": prediction,
            "water_quality": water_quality,
            "risk_score": round(final_risk, 1),
            "anomaly": iso_anomaly or len(rule_violations) > 0,
            "confidence": round(confidence, 1),
            "reason": reason,
            "recommendation": recommendation,
            "contributing_factors": factors
        }
