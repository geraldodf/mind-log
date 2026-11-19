package com.mindlog.services.retrospective;

import com.mindlog.data.dtos.retrospective.RetrospectiveDTO;
import com.mindlog.repositories.UserMediaRepository;
import com.mindlog.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RetrospectiveService {

    private static final int MIN_YEAR = 1900;

    private final UserMediaRepository repo;
    private final AuthService service;

    /** Years in which the user completed something, newest first. */
    public List<Integer> getYears() {
        return repo.findCompletedYears(service.authenticatedId());
    }

    public RetrospectiveDTO getRetrospective(int year) {
        if (year < MIN_YEAR || year > LocalDate.now().getYear() + 1) throw new IllegalArgumentException("Invalid year.");
        Long userId = service.authenticatedId();
        var completed = repo.findCompletedBetween(userId, LocalDate.of(year, 1, 1), LocalDate.of(year, 12, 31));
        return RetrospectiveCalculator.calculate(year, completed, repo.countCompletedWithoutDates(userId));
    }
}
