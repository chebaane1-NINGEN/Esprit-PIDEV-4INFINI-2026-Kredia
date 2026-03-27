package com.kredia.entity.wallet;
import com.kredia.entity.credit.Echeance;
import jakarta.persistence.*;

@Entity
@DiscriminatorValue("LOAN")
public class TransactionLoan extends Transaction {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "echeance_id")
    private Echeance echeance;

    public TransactionLoan() {
    }

    public Echeance getEcheance() {
        return echeance;
    }

    public void setEcheance(Echeance echeance) {
        this.echeance = echeance;
    }
}
