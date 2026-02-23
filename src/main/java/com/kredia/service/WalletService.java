package com.kredia.service;

import com.kredia.dto.WalletResponseDTO;
import com.kredia.entity.wallet.Wallet;
import com.kredia.repository.WalletRepository;
import com.kredia.user.entity.User;
import com.kredia.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Objects;

@Service
public class WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    public WalletService(WalletRepository walletRepository, UserRepository userRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
    }

    public WalletResponseDTO getMyWallet(Long userId) {
        Long requiredUserId = Objects.requireNonNull(userId, "userId");
        Wallet wallet = walletRepository.findByUser_UserId(requiredUserId)
                .orElseGet(() -> createWalletForUser(requiredUserId));

        return mapToDTO(wallet);
    }

    private Wallet createWalletForUser(Long userId) {
        Long requiredUserId = Objects.requireNonNull(userId, "userId");
        User user = userRepository.findById(requiredUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setBalance(BigDecimal.ZERO);
        wallet.setFrozenBalance(BigDecimal.ZERO);
        
        return walletRepository.save(wallet);
    }

    private WalletResponseDTO mapToDTO(Wallet wallet) {
        return WalletResponseDTO.builder()
                .walletId(wallet.getWalletId())
                .balance(wallet.getBalance())
                .frozenBalance(wallet.getFrozenBalance())
                .status(wallet.getStatus())
                .createdAt(wallet.getCreatedAt())
                .build();
    }
}
