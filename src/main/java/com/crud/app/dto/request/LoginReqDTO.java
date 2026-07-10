package com.crud.app.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.validator.constraints.Length;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginReqDTO {
    @Email
    @NotNull
    private String email;

    @NotNull
    @Length(min=5)
    private String password;
}
